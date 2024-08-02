export type LegendEntryContinuousProps = {
  type: 'continuous';
  title: string;
  subtitle: string;
  // TODO
};

export function LegendEntryContinuous(props: LegendEntryContinuousProps) {
  return (
    <section className="legend-section" key={props.title}>
      <p className="legend-section-title body2">{props.title}</p>
      <p className="legend-section-subtitle caption">{props.subtitle}</p>
      <div
        className="legend-gradient skeleton overline"
        style={{ height: '20px' }}
      >
        TODO
      </div>
    </section>
  );
}
