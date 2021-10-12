import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Turma from "./pages/Turma";
import ProfessorHome from "./pages/ProfessorHome";

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <ProfessorHome />
        </Route>
        <Route path="/turma/:id">
          <Turma />
        </Route>
      </Switch>
    </Router>
  );
}
