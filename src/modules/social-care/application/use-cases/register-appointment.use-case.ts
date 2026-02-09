import { Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { RegisterAppointmentCommand } from "@conecta/social-care/application/ports/commands/register-appointment.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, ClockPort } from "@conecta/ports";
import { Patient, PersonId, type AppointmentDraft, Timestamp } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

import { Result } from "@conecta/result";
import { UseCasePipeline } from "@conecta/fn";
import type { RegisterAppointmentCommand } from "@conecta/social-care/application/ports/commands/register-appointment.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, ClockPort } from "@conecta/ports";
import { Patient, PersonId, type AppointmentDraft, Timestamp } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

export type RegisterAppointmentDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
  readonly clock: ClockPort;
};

export const makeRegisterAppointmentUseCase = (deps: RegisterAppointmentDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<RegisterAppointmentCommand>) =>
      Result.combine({
        personId: PersonId.create(command.patientId),
        professionalId: Uuid.create(command.professionalId),
        date: command.date 
          ? Timestamp.create({ value: command.date }) 
          : Result.ok(undefined),
        summary: Result.ok(command.summary),
        actionPlan: Result.ok(command.actionPlan),
        type: Result.ok(command.type),
      }),

    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.personId);

      const draft: AppointmentDraft = {
        summary: ctx.summary,
        actionPlan: ctx.actionPlan,
        type: ctx.type,
        date: ctx.date,
        professionalInChargeId: ctx.professionalId,
      };

      const updatedPatient = yield Patient.registerAppointment(
        patient,
        draft,
        deps.clock.now(),
        Uuid.v7().uuid,
        ctx.professionalId,
      );

      return Result.ok({ aggregate: updatedPatient, result: true });
    },

    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });
