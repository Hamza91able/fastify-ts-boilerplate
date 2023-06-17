import { Note } from "@prisma/client";

type NOTE_RESPONSE_DTO = {
  owner: String;
  note: String;
  createdAt: Date;
};

export const noteResponseDTO = (data: Note) => {
  const note: NOTE_RESPONSE_DTO = {
    owner: data.owner,
    note: data.note,
    createdAt: data.createdAt,
  };

  return note;
};

export const toNoteResposeDTO = (data: Note[]) => {
  const notes = data.map((data) => noteResponseDTO(data));

  return notes;
};
