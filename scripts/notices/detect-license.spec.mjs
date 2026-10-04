import { describe, expect, it } from 'vitest';
import {
  detectLicenseId,
  extractCopyrightLines,
  normalizeLicenseId,
} from './detect-license.mjs';

const MIT_TEXT = `MIT License

Copyright (c) 2024 Example Corp

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
`;

describe('normalizeLicenseId', () => {
  it('maps common npm license field aliases to SPDX ids', () => {
    expect(normalizeLicenseId('MIT')).toBe('MIT');
    expect(normalizeLicenseId('  mit ')).toBe('MIT');
    expect(normalizeLicenseId('Apache-2.0')).toBe('Apache-2.0');
    expect(normalizeLicenseId('Apache 2.0')).toBe('Apache-2.0');
  });

  it('returns null for empty or non-string values', () => {
    expect(normalizeLicenseId('')).toBeNull();
    expect(normalizeLicenseId(undefined)).toBeNull();
    expect(normalizeLicenseId(42)).toBeNull();
  });

  it('passes unknown ids through unchanged', () => {
    expect(normalizeLicenseId('LicenseRef-Custom')).toBe('LicenseRef-Custom');
  });
});

describe('detectLicenseId', () => {
  it('prefers the package.json license field', () => {
    const result = detectLicenseId({ license: 'Apache-2.0' }, MIT_TEXT);
    expect(result).toEqual({ licenseId: 'Apache-2.0', detectedBy: 'package.json' });
  });

  it('supports the legacy licenses array field', () => {
    const result = detectLicenseId({ licenses: [{ type: 'MIT' }] }, '');
    expect(result?.licenseId).toBe('MIT');
  });

  it('falls back to license text sniffing when the field is absent', () => {
    const result = detectLicenseId({}, MIT_TEXT);
    expect(result).toEqual({ licenseId: 'MIT', detectedBy: 'license-text' });
  });

  it('detects the AGPL preamble from license text', () => {
    const agpl = 'GNU AFFERO GENERAL PUBLIC LICENSE\n Version 3, 19 November 2007';
    expect(detectLicenseId({}, agpl)?.licenseId).toBe('AGPL-3.0');
  });

  it('returns null when nothing can be identified', () => {
    expect(detectLicenseId({}, 'proprietary, all rights reserved')).toBeNull();
  });
});

describe('extractCopyrightLines', () => {
  it('keeps only notice lines and drops license conditions', () => {
    const lines = extractCopyrightLines(MIT_TEXT);
    expect(lines).toEqual(['Copyright (c) 2024 Example Corp']);
  });

  it('collects multiple copyright holders in order without duplicates', () => {
    const text = [
      'Copyright (c) 2018+ MarkedJS',
      'Copyright (c) 2011-2018, Christopher Jeffrey',
      'Copyright (c) 2018+ MarkedJS',
      'The above copyright notice and this permission notice shall be included',
    ].join('\n');
    expect(extractCopyrightLines(text)).toEqual([
      'Copyright (c) 2018+ MarkedJS',
      'Copyright (c) 2011-2018, Christopher Jeffrey',
    ]);
  });

  it('returns an empty list when there is no copyright notice', () => {
    expect(extractCopyrightLines('')).toEqual([]);
    expect(extractCopyrightLines(undefined)).toEqual([]);
  });
});