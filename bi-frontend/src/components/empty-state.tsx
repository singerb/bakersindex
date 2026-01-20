import { NavLink, useRevalidator } from "react-router";
import { Button } from "@/components/ui/button";
import client from "@/auth0-client";
import { createFormula } from "@/api";
import queryClient from "@/query-client";

export function EmptyState() {
  const { revalidate } = useRevalidator();

  const samples = [
    {
      name: "Country Sourdough",
      parts: [
        { ingredient: "Bread Flour", percent: 100.0, isBase: true },
        { ingredient: "Water", percent: 75.0, isBase: false },
        { ingredient: "Salt", percent: 2.5, isBase: false },
        { ingredient: "Leaven", percent: 15, isBase: false },
      ],
      baseIndex: "0",
    },
    {
      name: "Overnight Pizza Dough",
      parts: [
        { ingredient: "Pizza Flour", percent: 100.0, isBase: true },
        { ingredient: "Water", percent: 70.0, isBase: false },
        { ingredient: "Salt", percent: 2, isBase: false },
        { ingredient: "Instant Yeast", percent: 0.4, isBase: false },
      ],
      baseIndex: "0",
    },
  ];

  const submitFn = async () => {
    const token = await client.getTokenSilently();

    for (const sample of samples) {
      // await API post, get formula back
      // no bulk endpoint, so do these one by one
      await createFormula(token, sample);
    }

    // invalidate all formulas and refetch
    await queryClient.invalidateQueries({ queryKey: ["formulas"], refetchType: "all" });

    // revalidate the router; don't await since we can redirect while we revalidate
    // TODO: can we do this better with a fetcher or Form plus client action? How can we combine all that with tanstack form?
    await revalidate();

    // redirect to the formula page
    // await navigate("/formula/" + newFormula.id);
  };

  return (
    <div>
      <p className="py-4">Would you like to add some sample formulas to get a sense of how the app works? You can delete them at any time.</p>
      <Button className="bg-amber-900 hover:bg-amber-950" onClick={submitFn}>Add samples</Button> or <Button asChild variant="outline"><NavLink to="/formula/new">Create my own</NavLink></Button>
    </div>
  );
}
