import{describe,expect,it}from"vitest";import{authorize,can}from"./permissions";
describe("permissions",()=>{it("lets admins manage settings",()=>expect(can("ADMIN","settings:manage")).toBe(true));it("blocks instructors from settings",()=>{expect(can("INSTRUCTOR","settings:manage")).toBe(false);expect(()=>authorize("INSTRUCTOR","settings:manage")).toThrow("FORBIDDEN")});});
