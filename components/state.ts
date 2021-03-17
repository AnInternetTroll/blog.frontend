import { useState } from "react";
import { createContainer } from "react-tracked";

import { User } from "../models/api";

export interface State {
	user: User;
}

const initialState: State = {
	user: null,
};

const useValue = () => useState(initialState);

export const { Provider, useTracked } = createContainer(useValue);
