import { CreateVaultUseCase } from '../core/application/use-cases/create-vault.use-case';
import { DeleteVaultUseCase } from '../core/application/use-cases/delete-vault.use-case';
import { FileContentUseCase } from '../core/application/use-cases/file-content.use-case';
import { ListVaultsUseCase } from '../core/application/use-cases/list-vaults.use-case';
import { ManageFileNodeUseCase } from '../core/application/use-cases/manage-file-node.use-case';
import { ManagePreferencesUseCase } from '../core/application/use-cases/manage-preferences.use-case';
import { ManageSessionUseCase } from '../core/application/use-cases/manage-session.use-case';
import { UpdateVaultUseCase } from '../core/application/use-cases/update-vault.use-case';
import { HttpFileRepository } from './storage/http-file.repository';
import { HttpVaultRepository } from './storage/http-vault.repository';
import { IndexedDbFileRepository } from './storage/indexeddb-file.repository';
import { IndexedDbVaultRepository } from './storage/indexeddb-vault.repository';
import { localPreferencesRepository } from './storage/local-preferences.repository';
import { LocalSessionRepository } from './storage/local-session.repository';
import { systemClock } from './storage/system-clock';

// ---------------------------------------------------------------------------
// Time
//
// One clock instance is shared by every layer, so a test that needs a
// deterministic `updatedAt` can substitute `FixedClock` in a single place.
// ---------------------------------------------------------------------------
export { systemClock, FixedClock } from './storage/system-clock';

export const indexedDbVaultRepository = new IndexedDbVaultRepository(undefined, systemClock);
export const indexedDbFileRepository = new IndexedDbFileRepository(undefined, systemClock);

export const vaultRepository = new HttpVaultRepository(
  '/api/vaults',
  indexedDbVaultRepository,
  systemClock,
);
export const fileRepository = new HttpFileRepository(
  '/api/vaults',
  indexedDbFileRepository,
  systemClock,
);
export const sessionRepository = new LocalSessionRepository();
export const preferencesRepository = localPreferencesRepository;

// ---------------------------------------------------------------------------
// Use cases
// ---------------------------------------------------------------------------
export const createVaultUseCase = new CreateVaultUseCase(vaultRepository, systemClock, fileRepository);
export const listVaultsUseCase = new ListVaultsUseCase(vaultRepository);
export const deleteVaultUseCase = new DeleteVaultUseCase(
  vaultRepository,
  fileRepository,
  sessionRepository,
);
export const manageFileNodeUseCase = new ManageFileNodeUseCase(fileRepository, systemClock);
export const fileContentUseCase = new FileContentUseCase(fileRepository, systemClock);
export const manageSessionUseCase = new ManageSessionUseCase(sessionRepository, vaultRepository);
export const managePreferencesUseCase = new ManagePreferencesUseCase(preferencesRepository);
export const updateVaultUseCase = new UpdateVaultUseCase(vaultRepository, systemClock);