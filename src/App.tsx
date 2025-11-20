import { useState } from 'react';
import { Info } from 'lucide-react';

interface GenerationData {
  generation: number;
  newDisciples: number;
  cumulative: number;
  monthsSinceStart: number;
}

interface CalculationResult {
  totalGenerations: number;
  totalMonths: number;
  years: number;
  remainingMonths: number;
  finalCumulative: number;
  displayReached: number;
  percentageReached: number;
  history: GenerationData[];
  warning?: string;
}

function App() {
  const [totalPopulation, setTotalPopulation] = useState<string>('');
  const [existingDisciples, setExistingDisciples] = useState<string>('');
  const [avgNewDisciples, setAvgNewDisciples] = useState<string>('');
  const [timePerCycle, setTimePerCycle] = useState<string>('');
  const [timeUnit, setTimeUnit] = useState<string>('months');
  const [effectiveness, setEffectiveness] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    const P = parseFloat(totalPopulation);
    const D0 = parseFloat(existingDisciples);
    const R = parseFloat(avgNewDisciples);
    const cycleTime = parseFloat(timePerCycle);
    const effectivenessPercent = parseFloat(effectiveness);

    if (isNaN(P) || isNaN(D0) || isNaN(R) || isNaN(cycleTime) || isNaN(effectivenessPercent)) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    if (P <= 0 || D0 <= 0 || R < 0 || cycleTime <= 0 || effectivenessPercent < 0 || effectivenessPercent > 100) {
      alert('Please enter valid positive numbers and effectiveness between 0-100.');
      return;
    }

    const cycleMonths = timeUnit === 'years' ? cycleTime * 12 : cycleTime;
    const eff = effectivenessPercent / 100;
    const R_eff = R * eff;

    if (R_eff <= 1) {
      setResult({
        totalGenerations: 0,
        totalMonths: 0,
        years: 0,
        remainingMonths: 0,
        finalCumulative: D0,
        percentageReached: (D0 / P) * 100,
        history: [],
        warning: 'Your effective reproduction rate is ≤ 1. Under this model, the number of disciples will not grow fast enough to reach the whole population.'
      });
      return;
    }

    let generation = 0;
    let currentGenDisciples = D0;
    let cumulative = D0;
    const history: GenerationData[] = [
      { generation: 0, newDisciples: D0, cumulative: D0, monthsSinceStart: 0 }
    ];

    while (cumulative < P && generation < 1000) {
      generation++;
      currentGenDisciples = currentGenDisciples * R_eff;
      cumulative += currentGenDisciples;
      history.push({
        generation,
        newDisciples: currentGenDisciples,
        cumulative,
        monthsSinceStart: generation * cycleMonths
      });
    }

    const totalMonths = generation * cycleMonths;
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = Math.round(totalMonths % 12);

    const rawCoverage = (cumulative / P) * 100;
    const coveragePercent = Math.min(rawCoverage, 100);
    const displayReached = Math.min(cumulative, P);

    setResult({
      totalGenerations: generation,
      totalMonths,
      years,
      remainingMonths,
      finalCumulative: cumulative,
      displayReached,
      percentageReached: coveragePercent,
      history
    });
  };

  const location = locationName.trim() || 'this area';

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#F4F7F3' }}>
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-300">
          <h1 className="text-2xl font-bold mb-2 md:mb-0" style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}>
            Movement Multiplier
          </h1>
          <p className="text-sm" style={{ color: '#5F6F65' }}>
            Disciple-Making Movement visualizer
          </p>
        </header>

        <section className="mb-8 grid md:grid-cols-2 gap-6">
          <div>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: '#66BB6A', color: '#FFFFFF' }}
            >
              Vision Tool
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              How long to disciple a city?
            </h2>
            <p className="leading-relaxed" style={{ color: '#5F6F65' }}>
              Movement Multiplier is a simple sandbox that helps you estimate how many generations and how much time it might take to see a whole population discipled, assuming each disciple makes more disciples.
            </p>
          </div>

          <div
            className="rounded-xl p-6 shadow-md"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #2E7D32' }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Key Metrics
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: '#5F6F65' }}>Generations needed</p>
                <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
                  {result && !result.warning ? result.totalGenerations : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#5F6F65' }}>Estimated time</p>
                <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
                  {result && !result.warning
                    ? `${result.years}y ${result.remainingMonths}m`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#5F6F65' }}>Coverage</p>
                <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
                  {result && !result.warning
                    ? `${result.percentageReached.toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-xl shadow-lg p-6 md:p-8 mb-8" style={{ backgroundColor: '#FFFFFF' }}>
          <h3
            className="text-xl font-bold mb-6"
            style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Scenario Inputs
          </h3>

          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>
                Total population
              </label>
              <input
                type="number"
                value={totalPopulation}
                onChange={(e) => setTotalPopulation(e.target.value)}
                placeholder="e.g. 1,000,000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>
                Existing multiplying disciples
              </label>
              <input
                type="number"
                value={existingDisciples}
                onChange={(e) => setExistingDisciples(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>
                Average new disciples per disciple per cycle
              </label>
              <input
                type="number"
                value={avgNewDisciples}
                onChange={(e) => setAvgNewDisciples(e.target.value)}
                placeholder="e.g. 2"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>
                Time per discipleship cycle
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={timePerCycle}
                  onChange={(e) => setTimePerCycle(e.target.value)}
                  placeholder="3"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ borderRadius: '12px' }}
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ borderRadius: '12px' }}
                >
                  <option value="months">months</option>
                  <option value="years">years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2E7D32' }}>
                Reproduction effectiveness (%)
                <div className="group relative">
                  <Info className="w-4 h-4 cursor-help" style={{ color: '#5F6F65' }} />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-3 rounded-lg shadow-lg z-10" style={{ backgroundColor: '#2E7D32', color: '#FFFFFF' }}>
                    <p className="text-xs">
                      This controls what percentage of new disciples become disciple-makers; together with 'Average new disciples per cycle' it determines whether the movement multiplies (effective rate &gt; 1) or stalls (≤ 1).
                    </p>
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={effectiveness}
                onChange={(e) => setEffectiveness(e.target.value)}
                min="0"
                max="100"
                placeholder="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderRadius: '12px' }}
              />
              <p className="text-xs mt-1" style={{ color: '#5F6F65' }}>
                Realistically, not every disciple will make disciples. Adjust this to reflect your context.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>
                Location name <span style={{ color: '#5F6F65', fontWeight: 'normal' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Johannesburg, Buffalo…"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full md:w-auto px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#2E7D32', borderRadius: '12px' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1B5E20'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
          >
            Run Calculation
          </button>

          {result && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              {result.warning ? (
                <div className="rounded-lg p-6 space-y-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #F44336', borderRadius: '12px' }}>
                  <h4 className="text-xl font-bold" style={{ color: '#D32F2F', fontFamily: 'Barlow Condensed, sans-serif' }}>
                    Effective reproduction rate too low to multiply
                  </h4>
                  <p style={{ color: '#5F6F65' }}>
                    With your current inputs, each disciple is replacing themselves with one or fewer new multiplying disciples on average. Mathematically, that means the number of disciples will stay the same or shrink over time, so this movement will never reach the whole population of this area under these assumptions.
                  </p>
                  <div>
                    <h5 className="text-lg font-semibold mb-2" style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}>
                      What you can adjust
                    </h5>
                    <ul className="space-y-2 ml-5" style={{ listStyleType: 'disc', color: '#5F6F65' }}>
                      <li>
                        Increase the average new disciples per disciple per cycle (for example, aim for 2–3 instead of 1).
                      </li>
                      <li>
                        Increase the reproduction effectiveness (%) by focusing on faithful, available people who will also make disciples.
                      </li>
                      <li>
                        Consider a longer discipleship cycle so biblical concepts are fully grasped. This doesn't change the math by itself, but in real life a deeper, slower process can improve responsiveness and effectiveness over time.
                      </li>
                      <li>
                        Start with more initial multiplying disciples if possible, by building a small core team of disciple-makers first.
                      </li>
                    </ul>
                  </div>
                  <p className="text-xs" style={{ color: '#5F6F65' }}>
                    This is a simplified mathematical model meant to inspire vision, not predict real-world outcomes. Real disciple-making is slower, messier, and full of grace.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4
                      className="text-2xl font-bold mb-4"
                      style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      Results
                    </h4>
                    <div className="space-y-3">
                      <p className="text-lg" style={{ color: '#5F6F65' }}>
                        You need approximately <span className="font-bold" style={{ color: '#2E7D32' }}>{result.totalGenerations} generations</span> of disciple-making.
                      </p>
                      <p className="text-lg" style={{ color: '#5F6F65' }}>
                        That's about{' '}
                        <span className="font-bold" style={{ color: '#2E7D32' }}>
                          {result.years > 0 && `${result.years} ${result.years === 1 ? 'year' : 'years'}`}
                          {result.years > 0 && result.remainingMonths > 0 && ' and '}
                          {result.remainingMonths > 0 && `${result.remainingMonths} ${result.remainingMonths === 1 ? 'month' : 'months'}`}
                        </span>.
                      </p>
                      <p className="text-lg" style={{ color: '#5F6F65' }}>
                        By generation {result.totalGenerations}, you will have reached approximately{' '}
                        <span className="font-bold" style={{ color: '#2E7D32' }}>
                          {Math.round(result.displayReached).toLocaleString()} people
                        </span>, which is about{' '}
                        <span className="font-bold" style={{ color: '#2E7D32' }}>
                          {result.percentageReached.toFixed(1)}%
                        </span> of the population of {location}.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg p-5 overflow-x-auto" style={{ backgroundColor: '#F4F7F3', borderRadius: '12px' }}>
                    <h5
                      className="font-semibold mb-4"
                      style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      Generation Overview (first 10 generations)
                    </h5>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2" style={{ borderColor: '#2E7D32' }}>
                          <th className="text-left py-3 px-3 font-semibold" style={{ color: '#2E7D32' }}>Generation</th>
                          <th className="text-left py-3 px-3 font-semibold" style={{ color: '#2E7D32' }}>New disciples</th>
                          <th className="text-left py-3 px-3 font-semibold" style={{ color: '#2E7D32' }}>Cumulative</th>
                          <th className="text-left py-3 px-3 font-semibold" style={{ color: '#2E7D32' }}>Time since start</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.history.slice(0, 10).map((gen, idx) => (
                          <tr
                            key={gen.generation}
                            className="border-b border-gray-200"
                            style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F4F7F3' }}
                          >
                            <td className="py-3 px-3" style={{ color: '#5F6F65' }}>{gen.generation}</td>
                            <td className="py-3 px-3" style={{ color: '#5F6F65' }}>{Math.round(gen.newDisciples).toLocaleString()}</td>
                            <td className="py-3 px-3" style={{ color: '#5F6F65' }}>{Math.round(gen.cumulative).toLocaleString()}</td>
                            <td className="py-3 px-3" style={{ color: '#5F6F65' }}>{(gen.monthsSinceStart / 12).toFixed(1)} years</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {result && !result.warning && (
          <div
            className="rounded-xl p-6 shadow-md"
            style={{
              backgroundColor: '#E8F5E9',
              borderLeft: '6px solid #66BB6A',
              borderRadius: '12px'
            }}
          >
            <h4
              className="text-lg font-bold mb-3"
              style={{ color: '#2E7D32', fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Movement Snapshot
            </h4>
            <p className="mb-3" style={{ color: '#2E7D32' }}>
              If each disciple in {location} faithfully invests in making {avgNewDisciples} new multiplying disciples every {timePerCycle} {timeUnit}, you could theoretically reach the whole population in about{' '}
              {result.years > 0 && `${result.years} ${result.years === 1 ? 'year' : 'years'}`}
              {result.years > 0 && result.remainingMonths > 0 && ' and '}
              {result.remainingMonths > 0 && `${result.remainingMonths} ${result.remainingMonths === 1 ? 'month' : 'months'}`}, assuming ideal reproduction.
            </p>
            <p className="text-sm" style={{ color: '#5F6F65' }}>
              This is a simplified mathematical model meant to inspire vision, not predict real-world outcomes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
