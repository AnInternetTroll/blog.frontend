import { useState } from "react";
import { createContainer } from "react-tracked";

import { User } from "../models/api";

export interface State {
	user?: User;
	theme?: "dark_theme" | "light_theme";
}

const initialState: State = {
	user: null,
	theme: "light_theme",
};

const useValue = () => useState(initialState);

export const { Provider, useTracked } = createContainer(useValue);
