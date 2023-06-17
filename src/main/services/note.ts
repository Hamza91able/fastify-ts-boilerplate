import { CREATE_NOTE_TYPE, GET_NOTE_TYPE } from "../dto/request/note";
import { noteRepository } from "../repositories/";

const noteService = {
  createNote: async (data: CREATE_NOTE_TYPE) => {
    return await noteRepository.createNote(data);
  },
  getNotes: async (data: GET_NOTE_TYPE) => {
    return await noteRepository.getNotes(data);
  },
};

export default noteService;
