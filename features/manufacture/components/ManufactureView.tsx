import * as React from "react";
import { ManufactureHero } from "./ManufactureHero";
import { MaterialManifestGrid } from "./MaterialManifestGrid";
import { CaliberArchitectureSplit } from "./CaliberArchitectureSplit";
import { TestingProtocolRail } from "./TestingProtocolRail";
import { ManufactureCtaBanner } from "./ManufactureCtaBanner";

export function ManufactureView() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 md:py-16">
      <ManufactureHero />
      <MaterialManifestGrid />
      <CaliberArchitectureSplit />
      <TestingProtocolRail />
      <ManufactureCtaBanner />
    </div>
  );
}
