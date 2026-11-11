import React, { ComponentProps } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import SeriesList from "../../components/card-item-list/card-list-item/series-list";

const renderSeriesList = (
  series: ComponentProps<typeof SeriesList>["series"]
) =>
  render(
    <SeriesList
      series={series}
      searchUrl={new URL("https://example.com/search")}
      seriesUrl={new URL("https://example.com/serie/:seriesid")}
      t={(key) => key}
    />
  );

describe("SeriesList", () => {
  afterEach(cleanup);

  it("shows the number of a numbered series", () => {
    renderSeriesList([{ title: "Tænkepauser", numberInSeries: "Del 142" }]);

    const heading = screen.getByRole("heading").textContent;
    expect(heading).toContain("Del 142");
    expect(heading).toContain("inSeriesText");
    expect(screen.getByRole("link", { name: "Tænkepauser" })).toBeTruthy();
  });

  it("shows a series the material has no number in", () => {
    renderSeriesList([{ title: "Bag om København" }]);

    const heading = screen.getByRole("heading").textContent;
    expect(heading).toContain("partOfSeriesText");
    expect(heading).not.toContain("inSeriesText");
    expect(screen.getByRole("link", { name: "Bag om København" })).toBeTruthy();
  });
});
