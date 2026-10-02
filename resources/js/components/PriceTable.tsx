import { priceRows } from "../data/mockData";

type PriceRow = (typeof priceRows)[number];

export default function PriceTable({ compact = false, rows = priceRows }: { compact?: boolean; rows?: PriceRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Livestock</th><th>Official price</th><th>7-day change</th>{!compact && <th>Effective</th>}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.species}>
              <td><span className="species-mark">{row.species.slice(0, 2).toUpperCase()}</span><span><strong>{row.species}</strong><small>{row.breed}</small></span></td>
              <td><strong>₱{row.price}.00</strong><small>per kilogram</small></td>
              <td><span className={`trend trend-${row.tone}`}>{row.trend}</span></td>
              {!compact && <td>{row.updated}, 2025</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
