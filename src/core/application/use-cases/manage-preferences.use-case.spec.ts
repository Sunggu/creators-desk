import { describe, expect, it } from 'vitest';
import { ManagePreferencesUseCase } from './manage-preferences.use-case';
import type { PreferencesDto } from '../../domain/preferences.dto';
import type { PreferencesRepository } from '../ports/preferences.repository';
import { SYSTEM_TIME_ZONE } from '../../domain/time/time-zone.dto';

function createRepo(initial?: PreferencesDto) {
  let stored: PreferencesDto | undefined = initial;
  const repo: PreferencesRepository = {
    get: () => stored ?? { locale: 'ko', timeZone: SYSTEM_TIME_ZONE },
    save: (next) => {
      stored = next;
    },
  };
  return { repo, read: () => stored };
}

describe('ManagePreferencesUseCase', () => {
  it('returns the baseline defaults when nothing is stored', () => {
    const { repo } = createRepo();
    const useCase = new ManagePreferencesUseCase(repo);

    expect(useCase.getPreferences()).toEqual({ locale: 'ko', timeZone: SYSTEM_TIME_ZONE });
  });

  it('repairs hand-edited garbage instead of throwing', () => {
    const { repo } = createRepo({ locale: 'fr', timeZone: 'Mars/Olympus' } as never);
    const useCase = new ManagePreferencesUseCase(repo);

    expect(useCase.getPreferences()).toEqual({ locale: 'ko', timeZone: SYSTEM_TIME_ZONE });
  });

  it('persists a partial patch and merges it onto the current value', () => {
    const { repo, read } = createRepo({ locale: 'ko', timeZone: 'Asia/Seoul' });
    const useCase = new ManagePreferencesUseCase(repo);

    const next = useCase.updatePreferences({ timeZone: 'UTC' });

    expect(next).toEqual({ locale: 'ko', timeZone: 'UTC' });
    expect(read()).toEqual({ locale: 'ko', timeZone: 'UTC' });
  });

  it('leaves untouched fields alone when a field is omitted', () => {
    const { repo, read } = createRepo({ locale: 'en', timeZone: 'Asia/Seoul' });
    const useCase = new ManagePreferencesUseCase(repo);

    useCase.updatePreferences({ locale: 'ko' });

    expect(read()).toEqual({ locale: 'ko', timeZone: 'Asia/Seoul' });
  });

  it('drops invalid values rather than failing the save', () => {
    const { repo, read } = createRepo({ locale: 'en', timeZone: 'UTC' });
    const useCase = new ManagePreferencesUseCase(repo);

    const next = useCase.updatePreferences({
      timeZone: 'Mars/Olympus',
    } as never);

    expect(next.timeZone).toBe(SYSTEM_TIME_ZONE);
    expect(read()).toEqual({ locale: 'en', timeZone: SYSTEM_TIME_ZONE });
  });

  it('offers the follow-the-runtime row plus real zones', () => {
    const { repo } = createRepo();
    const useCase = new ManagePreferencesUseCase(repo);
    const options = useCase.listTimeZoneOptions();

    expect(options[0].isSystem).toBe(true);
    expect(options.some((option) => option.value === 'Asia/Seoul')).toBe(true);
  });
});