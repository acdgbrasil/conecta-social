import { UseCasePipeline } from "@conecta/fn";
import type { ClockPort, EventBusPort } from "@conecta/ports";
import { Result } from "@conecta/result";
import { Patient, PersonId, Timestamp } from "@conecta/social-care";
import type { CreateReferralCommand } from "@conecta/social-care/application/ports/commands/create-referral.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import { Uuid } from "@conecta/uuid";

export type CreateReferralDeps = {
	readonly repository: PatientRepositoryPort;
	readonly eventBus: EventBusPort;
	readonly clock: ClockPort;
};

export const makeCreateReferralUseCase = (deps: CreateReferralDeps) =>
	UseCasePipeline.build({
		parse: (command: Readonly<CreateReferralCommand>) =>
			Result.combine({
				patientPersonId: PersonId.create(command.patientId),
				referredPersonId: Uuid.create(command.referredPersonId),
				requestingProfessionalId: command.professionalId
					? Uuid.create(command.professionalId)
					: Result.ok(undefined),
				date: command.date
					? Timestamp.create({ value: command.date })
					: Result.ok(undefined),
				destinationService: Result.ok(command.destinationService),
				reason: Result.ok(command.reason),
			}),

		handle: async function* (ctx) {
			const patient = yield deps.repository.findByPersonId(ctx.patientPersonId);

			const updatedPatient = yield Patient.createReferral(
				patient,
				{
					referredPersonId: ctx.referredPersonId,
					destinationService: ctx.destinationService,
					reason: ctx.reason,
					requestingProfessionalId: ctx.requestingProfessionalId,
					date: ctx.date,
				},
				deps.clock.now(),
				Uuid.v7().uuid,
				Uuid.v7().uuid,
			);
			return Result.ok({ aggregate: updatedPatient, result: true });
		},
		repository: deps.repository,
		eventBus: deps.eventBus,
		pullEvents: Patient.pullDomainEvents,
	});
