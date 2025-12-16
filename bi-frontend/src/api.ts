import { up } from 'up-fetch'
import { z } from 'zod'

const upfetch = up(fetch);

const Formula = z.object({
  id: z.number(),
  name: z.string(),
});

const Formulas = z.array(Formula);

export type Formulas = z.infer<typeof Formulas>;
export type Formula = z.infer<typeof Formula>;

export async function loadFormulas(accessToken: string) {
    const events = await upfetch(import.meta.env.VITE_API_BASE + '/formulas', {
      schema: Formulas,
      headers: { Authorization: "Bearer " + accessToken },
    });

    return events;
}

export async function loadFormula(accessToken: string, formulaId: number) {
    const event = await upfetch(import.meta.env.VITE_API_BASE + '/formula/' + formulaId, {
      schema: Formula,
      headers: { Authorization: "Bearer " + accessToken },
    });

    return event;
}
