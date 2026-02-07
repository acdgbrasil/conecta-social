import { describe, expect, test } from "bun:test";
import { List } from "../../../fn-pattern/imutable-list";

describe("ImutableList", () => {
	test("empty() should return an empty list", () => {
		const list = List.empty<number>();
		expect(List.isEmpty(list)).toBe(true);
		expect(List.count(list)).toBe(0);
	});

	test("of() should create a list from elements", () => {
		const list = List.of(1, 2, 3);
		expect(List.count(list)).toBe(3);
		expect(list).toEqual([1, 2, 3]);
	});

	test("from() should create a list from an iterable", () => {
		const set = new Set([1, 2, 3]);
		const list = List.from(set);
		expect(list).toEqual([1, 2, 3]);
	});

	test("add() should return a new list with the added element", () => {
		const list = List.of(1, 2);
		const newList = List.add(list, 3);
		expect(newList).toEqual([1, 2, 3]);
		expect(list).toEqual([1, 2]); // Original list remains unchanged
	});

	test("remove() should return a new list without the specified element", () => {
		const list = List.of(1, 2, 3);
		const newList = List.remove(list, 2);
		expect(newList).toEqual([1, 3]);
		expect(list).toEqual([1, 2, 3]);
	});

	test("map() should transform elements", () => {
		const list = List.of(1, 2, 3);
		const newList = List.map(list, (n) => n * 2);
		expect(newList).toEqual([2, 4, 6]);
	});

	test("filter() should filter elements", () => {
		const list = List.of(1, 2, 3, 4);
		const newList = List.filter(list, (n) => n % 2 === 0);
		expect(newList).toEqual([2, 4]);
	});

	test("has() should return true if element exists", () => {
		const list = List.of(1, 2, 3);
		expect(List.has(list, 2)).toBe(true);
		expect(List.has(list, 4)).toBe(false);
	});

	test("unique() should remove duplicates for primitives", () => {
		const list = List.of(1, 2, 2, 3, 1);
		expect(List.unique(list)).toEqual([1, 2, 3]);
	});

	test("unique() should remove duplicates using key selector for objects", () => {
		const list = List.of({ id: 1 }, { id: 2 }, { id: 1 });
		const uniqueList = List.unique(list, (item) => item.id);
		expect(uniqueList).toEqual([{ id: 1 }, { id: 2 }]);
	});

	test("hasDuplicates() should detect duplicates correctly", () => {
		expect(List.hasDuplicates(List.of(1, 2, 3))).toBe(false);
		expect(List.hasDuplicates(List.of(1, 2, 1))).toBe(true);
	});

	test("hasDuplicates() with key selector for objects", () => {
		const list = List.of({ id: 1 }, { id: 2 }, { id: 1 });
		expect(List.hasDuplicates(list, (i) => i.id)).toBe(true);
		expect(List.hasDuplicates(list.slice(0, 2), (i) => i.id)).toBe(false);
	});

	test("toArray() should return a mutable copy", () => {
		const list = List.of(1, 2);
		const array = List.toArray(list);
		array.push(3);
		expect(array).toEqual([1, 2, 3]);
		expect(list).toEqual([1, 2]);
	});
});
