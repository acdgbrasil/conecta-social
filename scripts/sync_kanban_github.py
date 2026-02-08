#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any


KANBAN_SECTION_TODO = "To Do"
KANBAN_SECTION_IN_PROGRESS = "In Progress"
KANBAN_SECTION_DONE = "Done"

STATUS_CANDIDATES = {
    KANBAN_SECTION_TODO: ["Todo", "To Do", "To do", "Backlog"],
    KANBAN_SECTION_IN_PROGRESS: ["In Progress", "Doing", "Em andamento"],
    KANBAN_SECTION_DONE: ["Done", "Concluido", "Concluído", "Closed"],
}

DEFAULT_TYPE_OPTIONS = [
    "Feature",
    "Fix",
    "Bug",
    "Refactor",
    "Docs",
    "Infra",
    "Test",
    "Security",
    "Chore",
]

DEFAULT_PRIORITY_OPTIONS = ["Alta", "Média", "Baixa"]


@dataclass
class Task:
    task_id: str
    section: str
    kanban_title: str
    kanban_link: str
    task_path: Path
    task_title: str
    priority_raw: str | None
    priority: str | None
    labels: list[str]
    task_type: str


def normalize(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    without_marks = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return without_marks.strip().lower()


def run(
    cmd: list[str], dry_run: bool = False, mutate: bool = False, capture: bool = True
) -> str:
    if dry_run and mutate:
        print("[dry-run]", " ".join(cmd))
        return ""
    result = subprocess.run(cmd, text=True, capture_output=capture)
    if result.returncode != 0:
        raise RuntimeError(
            f"Command failed: {' '.join(cmd)}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
        )
    return result.stdout.strip()


def parse_task_labels(raw: str | None) -> list[str]:
    if not raw:
        return []
    labels = re.findall(r"`([^`]+)`", raw)
    if labels:
        return [label.strip() for label in labels if label.strip()]
    cleaned = re.sub(r"[*_`]", "", raw).strip()
    if not cleaned or cleaned.upper() == "N/A":
        return []
    return [part.strip() for part in cleaned.split(",") if part.strip()]


def infer_priority(raw: str | None) -> str | None:
    if not raw:
        return None
    n = normalize(raw)
    if "alta" in n:
        return "Alta"
    if "media" in n:
        return "Média"
    if "baixa" in n:
        return "Baixa"
    return None


def infer_type(labels: list[str]) -> str:
    ls = {normalize(label) for label in labels}
    if "feature" in ls:
        return "Feature"
    if "security" in ls:
        return "Security"
    if "bug" in ls:
        return "Bug"
    if "fix" in ls:
        return "Fix"
    if "refactor" in ls:
        return "Refactor"
    if "docs" in ls:
        return "Docs"
    if "test" in ls:
        return "Test"
    if "infra" in ls or "ci" in ls:
        return "Infra"
    return "Chore"


def resolve_task_path(link: str) -> Path:
    if link.startswith("./"):
        return Path("handbook") / link.replace("./", "", 1)
    if link.startswith("../"):
        return Path("handbook") / link.replace("../", "", 1)
    return Path(link)


def parse_kanban(kanban_path: Path) -> list[Task]:
    text = kanban_path.read_text(encoding="utf-8")
    section: str | None = None
    parsed: list[Task] = []
    seen: set[str] = set()

    for line in text.splitlines():
        if line.startswith("## "):
            if "To Do" in line:
                section = KANBAN_SECTION_TODO
            elif "In Progress" in line:
                section = KANBAN_SECTION_IN_PROGRESS
            elif "Done" in line:
                section = KANBAN_SECTION_DONE
            else:
                section = None
            continue

        row = re.search(r"\| \[(TASK-\d+)\]\(([^)]+)\) \| ([^|]+) \|", line)
        if not row or not section:
            continue

        task_id = row.group(1).strip()
        if task_id in seen:
            continue
        seen.add(task_id)

        link = row.group(2).strip()
        kanban_title = row.group(3).strip()
        task_path = resolve_task_path(link)

        task_title = kanban_title
        priority_raw: str | None = None
        labels: list[str] = []
        task_type = "Chore"
        priority: str | None = None

        if task_path.exists():
            content = task_path.read_text(encoding="utf-8")
            header = re.search(r"^#\s*\[(TASK-\d+)\]\s*(.+)$", content, re.M)
            if header:
                task_title = header.group(2).strip()
            prio_match = re.search(r"\*\*Prioridade:\*\*\s*(.+)", content)
            if prio_match:
                priority_raw = prio_match.group(1).strip()
            labels_match = re.search(r"\*\*Labels:\*\*\s*(.+)", content)
            if labels_match:
                labels = parse_task_labels(labels_match.group(1).strip())
            priority = infer_priority(priority_raw)
            task_type = infer_type(labels)

        parsed.append(
            Task(
                task_id=task_id,
                section=section,
                kanban_title=kanban_title,
                kanban_link=link,
                task_path=task_path,
                task_title=task_title,
                priority_raw=priority_raw,
                priority=priority,
                labels=labels,
                task_type=task_type,
            )
        )

    return parsed


def gh_json(cmd: list[str], dry_run: bool = False) -> Any:
    out = run(cmd, dry_run=dry_run, mutate=False)
    if not out:
        return {}
    return json.loads(out)


def pick_option_id(options: list[dict[str, Any]], desired_names: list[str]) -> str | None:
    by_norm = {normalize(option["name"]): option["id"] for option in options}
    for name in desired_names:
        key = normalize(name)
        if key in by_norm:
            return by_norm[key]
    return None


def ensure_labels(
    repo: str, labels: list[str], dry_run: bool
) -> tuple[list[str], dict[str, str]]:
    existing = gh_json(
        ["gh", "label", "list", "--repo", repo, "--limit", "500", "--json", "name"],
        dry_run=dry_run,
    )
    existing_names = {row["name"] for row in existing} if existing else set()
    existing_by_norm = {normalize(name): name for name in existing_names}
    created: list[str] = []
    resolution: dict[str, str] = {}
    for label in sorted(set(labels)):
        key = normalize(label)
        if key in existing_by_norm:
            resolution[label] = existing_by_norm[key]
            continue
        color = hashlib.md5(label.encode("utf-8")).hexdigest()[:6]
        run(
            [
                "gh",
                "label",
                "create",
                label,
                "--repo",
                repo,
                "--color",
                color,
                "--description",
                "Synced from handbook/KANBAN.md",
            ],
            dry_run=dry_run,
            mutate=True,
        )
        existing_by_norm[key] = label
        resolution[label] = label
        created.append(label)
    return created, resolution


def build_issue_body(task: Task, repo: str, default_branch: str) -> str:
    repo_path = task.task_path.as_posix()
    blob_url = f"https://github.com/{repo}/blob/{default_branch}/{repo_path}"
    content = task.task_path.read_text(encoding="utf-8") if task.task_path.exists() else ""
    labels = ", ".join(f"`{label}`" for label in task.labels) if task.labels else "N/A"
    priority = task.priority_raw if task.priority_raw else "N/A"
    return f"""## Origem
- Kanban: `{task.section}`
- Task file: `{repo_path}`
- Link da task: {blob_url}

## Metadados
- Prioridade: {priority}
- Labels da task (handbook): {labels}
- Tipo (derivado): {task.task_type}

## Conteúdo da Task

{content}
"""


def sync(args: argparse.Namespace) -> dict[str, Any]:
    tasks = parse_kanban(Path(args.kanban_file))
    if not tasks:
        raise RuntimeError("Nenhuma task foi encontrada no Kanban.")

    repo_info = gh_json(
        ["gh", "repo", "view", args.repo, "--json", "defaultBranchRef"],
        dry_run=args.dry_run,
    )
    default_branch = (
        repo_info.get("defaultBranchRef", {}).get("name", "main")
        if repo_info
        else "main"
    )

    issues = gh_json(
        [
            "gh",
            "issue",
            "list",
            "--repo",
            args.repo,
            "--state",
            "all",
            "--limit",
            "500",
            "--json",
            "number,title,state,url,labels",
        ],
        dry_run=args.dry_run,
    )
    issues = issues if isinstance(issues, list) else []

    issue_by_task_id: dict[str, dict[str, Any]] = {}
    for issue in issues:
        match = re.search(r"\[(TASK-\d+)\]", issue["title"])
        if match:
            issue_by_task_id[match.group(1)] = issue

    created_issues: list[str] = []
    for task in tasks:
        if task.task_id in issue_by_task_id:
            continue
        issue_title = f"[{task.task_id}] {task.task_title}"
        issue_body = build_issue_body(task, args.repo, default_branch)
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".md", encoding="utf-8", delete=False
        ) as tmp:
            tmp.write(issue_body)
            tmp_path = tmp.name

        out = run(
            [
                "gh",
                "issue",
                "create",
                "--repo",
                args.repo,
                "--title",
                issue_title,
                "--body-file",
                tmp_path,
            ],
            dry_run=args.dry_run,
            mutate=True,
        )
        if not args.dry_run:
            url = out.splitlines()[-1].strip()
            created_issues.append(url)

    if created_issues:
        # refresh issues map if new issues were created
        issues = gh_json(
            [
                "gh",
                "issue",
                "list",
                "--repo",
                args.repo,
                "--state",
                "all",
                "--limit",
                "500",
                "--json",
                "number,title,state,url,labels",
            ],
            dry_run=args.dry_run,
        )
        issues = issues if isinstance(issues, list) else []
        issue_by_task_id = {}
        for issue in issues:
            match = re.search(r"\[(TASK-\d+)\]", issue["title"])
            if match:
                issue_by_task_id[match.group(1)] = issue

    labels_created, label_resolution = ensure_labels(
        repo=args.repo,
        labels=[label for task in tasks for label in task.labels],
        dry_run=args.dry_run,
    )

    issues_closed: list[int] = []
    issues_reopened: list[int] = []
    issue_label_additions = 0
    issue_label_removals = 0

    for task in tasks:
        issue = issue_by_task_id.get(task.task_id)
        if not issue:
            continue
        number = str(issue["number"])
        is_open = issue["state"].upper() == "OPEN"
        should_be_open = task.section != KANBAN_SECTION_DONE

        if should_be_open and not is_open:
            run(
                ["gh", "issue", "reopen", number, "--repo", args.repo],
                dry_run=args.dry_run,
                mutate=True,
            )
            issues_reopened.append(int(number))
        if not should_be_open and is_open:
            run(
                ["gh", "issue", "close", number, "--repo", args.repo, "--reason", "completed"],
                dry_run=args.dry_run,
                mutate=True,
            )
            issues_closed.append(int(number))

        desired = {label_resolution.get(label, label) for label in task.labels}
        current = {row["name"] for row in issue.get("labels", [])}
        to_add = sorted(desired - current)
        to_remove = sorted(current - desired)

        if to_add:
            cmd = ["gh", "issue", "edit", number, "--repo", args.repo]
            for label in to_add:
                cmd += ["--add-label", label]
            run(cmd, dry_run=args.dry_run, mutate=True)
            issue_label_additions += len(to_add)
        if to_remove:
            cmd = ["gh", "issue", "edit", number, "--repo", args.repo]
            for label in to_remove:
                cmd += ["--remove-label", label]
            run(cmd, dry_run=args.dry_run, mutate=True)
            issue_label_removals += len(to_remove)

    project = gh_json(
        [
            "gh",
            "project",
            "view",
            str(args.project_number),
            "--owner",
            args.project_owner,
            "--format",
            "json",
        ],
        dry_run=args.dry_run,
    )
    project_id = project.get("id", "") if project else ""

    fields_out = gh_json(
        [
            "gh",
            "project",
            "field-list",
            str(args.project_number),
            "--owner",
            args.project_owner,
            "--format",
            "json",
        ],
        dry_run=args.dry_run,
    )
    fields = fields_out.get("fields", []) if isinstance(fields_out, dict) else []
    by_name = {field["name"]: field for field in fields}

    created_fields: list[str] = []

    if args.priority_field_name not in by_name:
        if args.dry_run:
            created_fields.append(args.priority_field_name)
            by_name[args.priority_field_name] = {
                "id": "dry-run-priority",
                "name": args.priority_field_name,
                "options": [
                    {"id": f"dry-run-prio-{idx}", "name": name}
                    for idx, name in enumerate(DEFAULT_PRIORITY_OPTIONS, start=1)
                ],
            }
        else:
            run(
                [
                    "gh",
                    "project",
                    "field-create",
                    str(args.project_number),
                    "--owner",
                    args.project_owner,
                    "--name",
                    args.priority_field_name,
                    "--data-type",
                    "SINGLE_SELECT",
                    "--single-select-options",
                    ",".join(DEFAULT_PRIORITY_OPTIONS),
                ],
                mutate=True,
            )
            created_fields.append(args.priority_field_name)

    if args.type_field_name not in by_name:
        if args.dry_run:
            created_fields.append(args.type_field_name)
            by_name[args.type_field_name] = {
                "id": "dry-run-type",
                "name": args.type_field_name,
                "options": [
                    {"id": f"dry-run-type-{idx}", "name": name}
                    for idx, name in enumerate(DEFAULT_TYPE_OPTIONS, start=1)
                ],
            }
        else:
            run(
                [
                    "gh",
                    "project",
                    "field-create",
                    str(args.project_number),
                    "--owner",
                    args.project_owner,
                    "--name",
                    args.type_field_name,
                    "--data-type",
                    "SINGLE_SELECT",
                    "--single-select-options",
                    ",".join(DEFAULT_TYPE_OPTIONS),
                ],
                mutate=True,
            )
            created_fields.append(args.type_field_name)

    if not args.dry_run:
        fields_out = gh_json(
            [
                "gh",
                "project",
                "field-list",
                str(args.project_number),
                "--owner",
                args.project_owner,
                "--format",
                "json",
            ],
            dry_run=args.dry_run,
        )
        fields = fields_out.get("fields", []) if isinstance(fields_out, dict) else []
        by_name = {field["name"]: field for field in fields}

    status_field = by_name.get("Status")
    priority_field = by_name.get(args.priority_field_name)
    type_field = by_name.get(args.type_field_name)
    if not status_field or not priority_field or not type_field:
        raise RuntimeError("Campos necessários do Project não encontrados.")

    items_out = gh_json(
        [
            "gh",
            "project",
            "item-list",
            str(args.project_number),
            "--owner",
            args.project_owner,
            "--limit",
            "200",
            "--format",
            "json",
        ],
        dry_run=args.dry_run,
    )
    items = items_out.get("items", []) if isinstance(items_out, dict) else []
    item_by_issue_number: dict[str, dict[str, Any]] = {}
    for item in items:
        content = item.get("content") or {}
        number = content.get("number")
        if number is not None:
            item_by_issue_number[str(number)] = item

    project_item_additions = 0
    for task in tasks:
        issue = issue_by_task_id.get(task.task_id)
        if not issue:
            continue
        number = str(issue["number"])
        if number in item_by_issue_number:
            continue
        run(
            [
                "gh",
                "project",
                "item-add",
                str(args.project_number),
                "--owner",
                args.project_owner,
                "--url",
                issue["url"],
            ],
            dry_run=args.dry_run,
            mutate=True,
        )
        project_item_additions += 1

    if project_item_additions:
        items_out = gh_json(
            [
                "gh",
                "project",
                "item-list",
                str(args.project_number),
                "--owner",
                args.project_owner,
                "--limit",
                "200",
                "--format",
                "json",
            ],
            dry_run=args.dry_run,
        )
        items = items_out.get("items", []) if isinstance(items_out, dict) else []
        item_by_issue_number = {}
        for item in items:
            content = item.get("content") or {}
            number = content.get("number")
            if number is not None:
                item_by_issue_number[str(number)] = item

    project_updates = 0
    for task in tasks:
        issue = issue_by_task_id.get(task.task_id)
        if not issue:
            continue
        number = str(issue["number"])
        item = item_by_issue_number.get(number)
        if not item:
            continue
        item_id = item["id"]

        status_option_id = pick_option_id(
            status_field.get("options", []), STATUS_CANDIDATES[task.section]
        )
        if status_option_id:
            run(
                [
                    "gh",
                    "project",
                    "item-edit",
                    "--id",
                    item_id,
                    "--project-id",
                    project_id,
                    "--field-id",
                    status_field["id"],
                    "--single-select-option-id",
                    status_option_id,
                ],
                dry_run=args.dry_run,
                mutate=True,
            )
            project_updates += 1

        if task.priority:
            priority_option_id = pick_option_id(
                priority_field.get("options", []), [task.priority]
            )
            if priority_option_id:
                run(
                    [
                        "gh",
                        "project",
                        "item-edit",
                        "--id",
                        item_id,
                        "--project-id",
                        project_id,
                        "--field-id",
                        priority_field["id"],
                        "--single-select-option-id",
                        priority_option_id,
                    ],
                    dry_run=args.dry_run,
                    mutate=True,
                )
                project_updates += 1

        type_option_id = pick_option_id(type_field.get("options", []), [task.task_type])
        if type_option_id:
            run(
                [
                    "gh",
                    "project",
                    "item-edit",
                    "--id",
                    item_id,
                    "--project-id",
                    project_id,
                    "--field-id",
                    type_field["id"],
                    "--single-select-option-id",
                    type_option_id,
                ],
                dry_run=args.dry_run,
                mutate=True,
            )
            project_updates += 1

    return {
        "dry_run": args.dry_run,
        "repo": args.repo,
        "project_owner": args.project_owner,
        "project_number": args.project_number,
        "tasks_parsed": len(tasks),
        "issues_found": len(issue_by_task_id),
        "issues_created": len(created_issues),
        "labels_created": len(labels_created),
        "issues_closed": len(issues_closed),
        "issues_reopened": len(issues_reopened),
        "issue_label_additions": issue_label_additions,
        "issue_label_removals": issue_label_removals,
        "project_fields_created": created_fields,
        "project_item_additions": project_item_additions,
        "project_updates": project_updates,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sync handbook/KANBAN.md with GitHub issues and project."
    )
    parser.add_argument("--repo", required=True, help="owner/repo")
    parser.add_argument("--project-owner", required=True, help="Organization/user owner")
    parser.add_argument("--project-number", required=True, type=int, help="Project number")
    parser.add_argument(
        "--kanban-file",
        default="handbook/KANBAN.md",
        help="Path to KANBAN markdown file",
    )
    parser.add_argument(
        "--priority-field-name",
        default="Prioridade",
        help="Project field name for priority",
    )
    parser.add_argument(
        "--type-field-name",
        default="Tipo",
        help="Project field name for issue type",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print commands without changing GitHub data",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        summary = sync(args)
        print(json.dumps(summary, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
