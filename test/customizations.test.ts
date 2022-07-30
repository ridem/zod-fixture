import { expect, test } from 'vitest';
import type { Customization } from '../src';
import { create } from '../src';
import { z } from 'zod';

test('creates a customization', () => {
	const customization: Customization = {
		condition: () => true,
		generator: () => 'MY_CUSTOMIZATION',
	};

	expect(customization.condition({ type: '' })).toBe(true);
	expect(customization.generator({ type: '' })).toBe('MY_CUSTOMIZATION');
});

test('customization sets the value based on the type', () => {
	const result = create(z.string(), {
		customizations: [
			{
				condition: (ctx): boolean => ctx.type === 'ZodString',
				generator: (ctx): string => `MY_CUSTOMIZATION_${ctx.type}`,
			},
		],
	});

	expect(result).toBe('MY_CUSTOMIZATION_ZodString');
});

test('customization sets the value based on the property name', () => {
	const result = create(
		z.object({
			name: z.string(),
			other: z.string(),
		}),
		{
			customizations: [
				{
					condition: (ctx): boolean => ctx.propertName === 'name',
					generator: (ctx): string => `MY_CUSTOMIZATION_${ctx.propertName}`,
				},
			],
		},
	);

	expect(result.name).toBe('MY_CUSTOMIZATION_name');
	expect(result.other).not.toBe('MY_CUSTOMIZATION_name');
});

test('the first matching customization sets the value', () => {
	const result = create(
		z.object({
			name: z.string(),
			other: z.string(),
		}),
		{
			customizations: [
				{
					condition: (ctx): boolean => ctx.propertName === 'name',
					generator: (): string => 'MY_CUSTOMIZATION',
				},
				{
					condition: (ctx): boolean => ctx.propertName === 'name',
					generator: (): string => 'MY_CUSTOMIZATION_2',
				},
			],
		},
	);

	expect(result.name).toBe('MY_CUSTOMIZATION');
	expect(result.other).not.toBe('MY_CUSTOMIZATION');
});
