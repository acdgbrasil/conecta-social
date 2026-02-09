export type MapperPort<DomainEntity, PersistenceModel> = {
    toDomain(raw: PersistenceModel): DomainEntity;
    toPersistence(entity: DomainEntity): PersistenceModel;
}