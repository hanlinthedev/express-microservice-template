import { AsyncLocalStorage } from "node:async_hooks";

export const asyncContext = new AsyncLocalStorage<{
	correlationId: string;
}>();

export const getCorrelationId = () => asyncContext.getStore()?.correlationId;
