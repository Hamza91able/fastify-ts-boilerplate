import { CREATE_NOTE_TYPE, GET_NOTE_TYPE } from "../dto/request/note";
import prisma from "../utils/prisma";

const noteRepository = {
  createNote: async (data: CREATE_NOTE_TYPE) => {
    return prisma.note.create({
      data,
    });
  },
  getNotes: async (data: GET_NOTE_TYPE) => {
    return prisma.note.findMany({
      skip: data.page - 1,
      take: data.perPage,
    });
  },
};

export default noteRepository;
