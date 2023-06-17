import { expect, jest, describe, it, afterEach } from "@jest/globals";
import { prismaMock } from "../context";
import { CREATE_NOTE_TYPE, GET_NOTE_TYPE } from "../../main/dto/request/note";
import { noteRepository } from "../../main/repositories";
import prisma from "../../main/utils/prisma";
import { NOTE_DB } from "../fixtures/note.fixture";

jest.mock("../../main/utils/prisma", () => ({
  __esModule: true,
  default: prismaMock,
}));

const mockNoteCreate = prisma.note.create as jest.MockedFunction<
  typeof prisma.note.create
>;
const mockNoteFindMany = prisma.note.findMany as jest.MockedFunction<
  typeof prisma.note.findMany
>;

describe("Note Repository Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createNote Test", () => {
    const data: CREATE_NOTE_TYPE = {
      owner: "Test User",
      note: "This is a test note",
    };

    it("should create note successfully", async () => {
      mockNoteCreate.mockReturnValue(NOTE_DB as any);

      const note = await noteRepository.createNote(data);

      expect(note).toStrictEqual(NOTE_DB);
    });
  });

  describe("getNotes Test", () => {
    const data: GET_NOTE_TYPE = {
      page: 1,
      perPage: 10,
    };

    it("should get notes successfully", async () => {
      mockNoteFindMany.mockReturnValue([NOTE_DB] as any);

      const notes = await noteRepository.getNotes(data);

      expect(notes).toStrictEqual([NOTE_DB]);
    });
  });
});
