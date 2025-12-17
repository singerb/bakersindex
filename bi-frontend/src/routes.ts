import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export default [
  index("Home.tsx"),
  route("callback", "Callback.tsx"),
  layout("MainPage.tsx", [ // this uses AuthenticationGuard to guard this whole area as logged-in
    index("Formulas.tsx", { id: "formulasIndex" }),
    route("formulas", "Formulas.tsx"),
    route("formula/:formulaId", "Formula.tsx"),
    route("formula/new", "CreateFormula.tsx"),
  ]),
] satisfies RouteConfig;
