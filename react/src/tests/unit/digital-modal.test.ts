import { describe, expect, it } from "vitest";
import { createDigitalModalId } from "../../components/material/digital-modal/helper";
import { Pid } from "../../core/utils/types/ids";

describe("createDigitalModalId", () => {
  // A Pid contains a colon (e.g. "870971-tsart:34310815"). The modal id is
  // carried through the login redirect as a URL query parameter, and the colon
  // did not survive that round-trip, so the returned id no longer matched the
  // mounted modal. The generated id must therefore need no URL encoding.
  const pid = "870971-tsart:34310815" as Pid;

  it("produces an id that needs no URL encoding", () => {
    // Sanity check that the raw Pid is not already URL-safe, so the assertion
    // below is meaningful.
    expect(encodeURIComponent(pid)).not.toBe(pid);

    const modalId = createDigitalModalId(pid);
    expect(modalId).toBe("digital-modal-870971-tsart-34310815");
    expect(encodeURIComponent(modalId)).toBe(modalId);
  });
});
