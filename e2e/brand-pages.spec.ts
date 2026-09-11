import { test, expect } from "@playwright/test";

test.describe("Brand Experience & Editorial Pages", () => {
  test.describe("Archive (/archive)", () => {
    test("renders header, 12 specimens, and handles filter changes", async ({
      page,
    }) => {
      await page.goto("/archive");

      // Verify header and initial specimen count
      await expect(page.locator("h1")).toContainText("The Archive");
      await expect(
        page.getByText("12 Active Specimens").first()
      ).toBeVisible();

      // Verify specimen cards rendered
      const cards = page.locator("article");
      await expect(cards).toHaveCount(12);

      // Verify specific specimen details
      await expect(page.getByText("Field Automatic 38")).toBeVisible();
      await expect(page.getByText("REF. NW-01-FLD")).toBeVisible();

      // Change dial filter to Basalt Slate
      const dialSelect = page.getByLabel("Filter by dial color");
      await dialSelect.selectOption("slate");

      // Verify URL updated with query param
      await expect(page).toHaveURL(/dial=slate/);

      // Verify active query ticker updated
      await expect(page.getByText("DIAL: SLATE")).toBeVisible();

      // Clear filters
      const clearBtn = page.getByRole("button", { name: "Clear All" });
      await expect(clearBtn).toBeVisible();
      await clearBtn.click();

      // Verify URL reset and all 12 specimens restored
      await expect(page).toHaveURL("/archive");
      await expect(page.locator("article")).toHaveCount(12);
    });

    test("displays empty state when filters match no specimens", async ({
      page,
    }) => {
      // Navigate with mutually exclusive filters (forest dial + 40mm case)
      await page.goto("/archive?dial=forest&caseSize=40mm");

      await expect(
        page.getByRole("heading", { name: "No matching archival specimens" })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Reset Archive Query" })
      ).toBeVisible();
    });
  });

  test.describe("Manufacture (/manufacture)", () => {
    test("renders monograph hero, material manifest, caliber blueprint, and testing protocols", async ({
      page,
    }) => {
      await page.goto("/manufacture");

      // Verify hero title and coordinates
      await expect(page.locator("h1")).toContainText(
        "Engineered in Stockholm."
      );
      await expect(page.locator("h1")).toContainText("Assembled in Geneva.");
      await expect(
        page.getByText("BENCH REF. ATELIER-SW-04").first()
      ).toBeVisible();

      // Verify 3 material cards
      await expect(
        page.getByRole("heading", { name: "316L Surgical Steel" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Double-Domed Sapphire" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Vegetable-Tanned Leather" })
      ).toBeVisible();

      // Verify Caliber NW-CAL.01 specifications
      await expect(
        page.getByText("The Architecture of Caliber NW-CAL.01")
      ).toBeVisible();
      await expect(page.getByText("28,800 VPH (4.0 HZ)")).toBeVisible();
      await expect(page.getByText("26 SYNTHETIC RUBIES")).toBeVisible();

      // Verify 4 testing phases
      await expect(page.getByText("Thermal Shock Cycling")).toBeVisible();
      await expect(page.getByText("Hydrostatic Pressure")).toBeVisible();
      await expect(page.getByText("Demagnetization Field")).toBeVisible();
      await expect(page.getByText("Micro-Acoustic Timing")).toBeVisible();

      // Verify Explore Active Collection CTA
      const exploreLink = page.getByRole("link", {
        name: "Explore Active Collection",
      });
      await expect(exploreLink).toBeVisible();
      await expect(exploreLink).toHaveAttribute("href", "/products");
    });
  });

  test.describe("Journal (/journal & /journal/[slug])", () => {
    test("renders masthead, lead monograph, category filtering, and newsletter subscription", async ({
      page,
    }) => {
      await page.goto("/journal");

      // Verify masthead title
      await expect(page.locator("h1")).toContainText(
        "The Northwatch Journal"
      );

      // Verify lead monograph
      await expect(
        page.getByText("The Aesthetics of Restraint")
      ).toBeVisible();
      await expect(page.getByText("Lars Engberg")).toBeVisible();

      // Switch category filter to Metallurgy & Craft
      const metallurgyTab = page.getByRole("button", {
        name: /Metallurgy & Craft/,
      });
      await metallurgyTab.click();
      await expect(page).toHaveURL(/category=metallurgy/);

      // Verify newsletter subscription form
      const emailInput = page.getByPlaceholder(
        "TECHNICAL CORRESPONDENT EMAIL"
      );
      await emailInput.fill("collector@northwatch.se");
      await page.getByRole("button", { name: "Inscribe" }).click();

      // Verify confirmation feedback
      await expect(
        page.getByText("CORRESPONDENCE REGISTERED ✓")
      ).toBeVisible();
    });

    test("navigates to individual dispatch reader view", async ({ page }) => {
      await page.goto("/journal");

      // Click Read Essay on lead feature
      const readEssayBtn = page.getByRole("link", { name: "Read Essay" });
      await readEssayBtn.click();

      // Verify URL and article content
      await expect(page).toHaveURL("/journal/the-aesthetics-of-restraint");
      await expect(
        page.getByRole("heading", { level: 1, name: /The Aesthetics of Restraint/ })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Return to Dispatches" })
      ).toBeVisible();

      // Verify pull quote and author
      await expect(page.locator("blockquote")).toBeVisible();
      await expect(
        page.getByText("Lars Engberg, Head of Atelier").first()
      ).toBeVisible();
    });

    test("renders custom branded 404 for unknown dispatch slug", async ({
      page,
    }) => {
      await page.goto("/journal/non-existent-dispatch-test");

      await expect(page.locator("h1")).toContainText("Dispatch Not Located");
      await expect(
        page.getByRole("link", { name: "Return to Journal Index" })
      ).toBeVisible();
    });
  });
});
