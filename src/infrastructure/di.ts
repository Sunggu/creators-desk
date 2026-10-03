import { CreateVaultUseCase } from '../core/application/use-cases/create-vault.use-case';
import { DeleteVaultUseCase } from '../core/application/use-cases/delete-vault.use-case';
import { FileContentUseCase } from '../core/application/use-cases/file-content.use-case';
import { ListVaultsUseCase } from '../core/application/use-cases/list-vaults.use-case';
import { ManageFileNodeUseCase } from '../core/application/use-cases/manage-file-node.use-case';
import { ManageSessionUseCase } from '../core/application/use-cases/manage-session.use-case';
import { IndexedDbFileRepository } from './storage/indexeddb-file.repository';
import { IndexedDbVaultRepository } from './storage/indexeddb-vault.repository';
import { LocalSessionRepository } from './storage/local-session.repository';

export const vaultRepository = new IndexedDbVaultRepository();
export const fileRepository = new IndexedDbFileRepository();
export const sessionRepository = new LocalSessionRepository();

export const createVaultUseCase = new CreateVaultUseCase(vaultRepository, fileRepository);
export const listVaultsUseCase = new ListVaultsUseCase(vaultRepository);
export const deleteVaultUseCase = new DeleteVaultUseCase(
  vaultRepository,
  fileRepository,
  sessionRepository,
);
export const manageFileNodeUseCase = new ManageFileNodeUseCase(fileRepository);
export const fileContentUseCase = new FileContentUseCase(fileRepository);
export const manageSessionUseCase = new ManageSessionUseCase(sessionRepository, vaultRepository);
