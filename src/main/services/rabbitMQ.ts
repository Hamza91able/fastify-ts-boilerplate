import { adapters } from "../adapters";

const rabbitMQService = {
  sendToEvent: async (payload: Object) => {
    const result = await adapters().queue.sendToEvent(payload);
    return result;
  },
  subscribeToEvent: (q: string, listener: Function) =>
    adapters().queue.subscribe(q, listener),
};

export default rabbitMQService;
