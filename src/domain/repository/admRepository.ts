export interface AdmRepository {
    createSuperAdm(name: string, email: string): Promise<Boolean | Error>;
}