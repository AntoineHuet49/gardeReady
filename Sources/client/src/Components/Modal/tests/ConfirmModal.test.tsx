import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmModal from "../ConfirmModal";

describe("ConfirmModal", () => {
    it("relie le dialog à son titre via aria-labelledby", () => {
        render(<ConfirmModal pending={null} onClose={vi.fn()} />);
        const title = screen.getByRole("heading", { hidden: true, name: "Confirmer la suppression" });
        expect(document.querySelector("dialog")?.getAttribute("aria-labelledby")).toBe(title.id);
    });
});
