export interface MaterialMetric {
  label: string;
  value: string;
}

export interface MaterialSpec {
  id: string;
  badge: string;
  category: string;
  title: string;
  description: string;
  image: string;
  altText: string;
  metrics: MaterialMetric[];
}

export interface CaliberParameter {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

export interface TestingPhase {
  phaseNumber: string;
  phaseTag: string;
  title: string;
  description: string;
  chamberRef: string;
}
