import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Certification } from '../types';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Hourglass,
  ArrowUpDown,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';

interface CertificationHoursD3ChartProps {
  certifications: Certification[];
  theme?: 'light' | 'dark';
}

type SortOption = 'default' | 'hoursSpent' | 'estimatedHours' | 'progress';
type ChartMode = 'grouped' | 'bullet';

export const CertificationHoursD3Chart: React.FC<CertificationHoursD3ChartProps> = ({
  certifications,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [chartMode, setChartMode] = useState<ChartMode>('grouped');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    cert: Certification | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    cert: null,
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    certifications.forEach((c) => set.add(c.category));
    return ['Todas', ...Array.from(set)];
  }, [certifications]);

  // Filter & Sort certifications
  const processedData = useMemo(() => {
    let data = certifications.filter((c) =>
      selectedCategory === 'Todas' ? true : c.category === selectedCategory
    );

    switch (sortOption) {
      case 'hoursSpent':
        data = [...data].sort((a, b) => b.hoursSpent - a.hoursSpent);
        break;
      case 'estimatedHours':
        data = [...data].sort((a, b) => b.estimatedHours - a.estimatedHours);
        break;
      case 'progress':
        data = [...data].sort((a, b) => {
          const progA = a.estimatedHours > 0 ? a.hoursSpent / a.estimatedHours : 0;
          const progB = b.estimatedHours > 0 ? b.hoursSpent / b.estimatedHours : 0;
          return progB - progA;
        });
        break;
      default:
        // default order
        break;
    }
    return data;
  }, [certifications, selectedCategory, sortOption]);

  // Calculate high level metrics
  const metrics = useMemo(() => {
    const totalEstimated = processedData.reduce((acc, c) => acc + c.estimatedHours, 0);
    const totalSpent = processedData.reduce((acc, c) => acc + c.hoursSpent, 0);
    const totalRemaining = Math.max(0, totalEstimated - totalSpent);
    const overallProgress = totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0;
    return {
      totalEstimated,
      totalSpent,
      totalRemaining,
      overallProgress,
    };
  }, [processedData]);

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 30, right: 30, bottom: 65, left: 60 };
    const width = Math.max(500, containerWidth) - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Defs: Gradients and filters
    const defs = svg.append('defs');

    // Gradient for Spent Hours (Emerald / Cyan glow)
    const spentGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-spent-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    spentGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    spentGrad.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

    // Gradient for Estimated Hours (Indigo / Sky)
    const estGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-est-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    estGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', isLight ? '#818cf8' : '#6366f1');
    estGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', isLight ? '#4f46e5' : '#4338ca');

    // Background track gradient for bullet mode
    const bulletBgGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-bullet-bg')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    bulletBgGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', isLight ? '#e0e7ff' : '#1e1b4b');
    bulletBgGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', isLight ? '#c7d2fe' : '#312e81');

    // Drop shadow filter for active bars
    const filter = defs.append('filter').attr('id', 'd3-bar-shadow');
    filter
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '4')
      .attr('flood-opacity', isLight ? '0.15' : '0.4')
      .attr('flood-color', '#000000');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Empty state
    if (processedData.length === 0) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', isLight ? '#64748b' : '#94a3b8')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text('Nenhuma certificação encontrada para este filtro.');
      return;
    }

    // Scales
    const x0Scale = d3
      .scaleBand()
      .domain(processedData.map((d) => d.code))
      .range([0, width])
      .padding(0.28);

    const maxHours = d3.max(processedData, (d) => Math.max(d.estimatedHours, d.hoursSpent, 10)) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxHours * 1.15])
      .nice()
      .range([height, 0]);

    // Grid lines (horizontal)
    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', isLight ? '#e2e8f0' : '#1e293b')
      .attr('stroke-dasharray', '3,3');

    g.select('.grid-lines .domain').remove();

    // Axes
    const xAxis = d3.axisBottom(x0Scale);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `${d}h`);

    // Render X Axis
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', isLight ? '#cbd5e1' : '#334155');

    xAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#1e293b' : '#f1f5f9')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('transform', width < 600 ? 'rotate(-20)' : '')
      .attr('text-anchor', width < 600 ? 'end' : 'middle')
      .attr('dx', width < 600 ? '-0.5em' : '0')
      .attr('dy', width < 600 ? '0.5em' : '1em');

    // Render Y Axis
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').attr('stroke', isLight ? '#cbd5e1' : '#334155');

    yAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#475569' : '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', isLight ? '#64748b' : '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text('Carga Horária (Horas)');

    // Render Bars based on chartMode
    if (chartMode === 'grouped') {
      // Sub-scale for grouped bars (Estimated vs Spent)
      const x1Scale = d3
        .scaleBand()
        .domain(['estimated', 'spent'])
        .range([0, x0Scale.bandwidth()])
        .padding(0.08);

      const certGroups = g
        .selectAll('.cert-group')
        .data(processedData)
        .enter()
        .append('g')
        .attr('class', 'cert-group')
        .attr('transform', (d) => `translate(${x0Scale(d.code)},0)`);

      // 1. Estimated Hours Bar (Indigo)
      certGroups
        .append('rect')
        .attr('class', 'bar-estimated')
        .attr('x', () => x1Scale('estimated') || 0)
        .attr('width', x1Scale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', 'url(#d3-est-grad)')
        .attr('stroke', isLight ? '#4338ca' : '#818cf8')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          d3.select(this)
            .attr('filter', 'url(#d3-bar-shadow)')
            .attr('stroke-width', 2);
          setTooltipData({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            cert: d,
          });
        })
        .on('mousemove', function (event) {
          setTooltipData((prev) => ({
            ...prev,
            x: event.clientX,
            y: event.clientY,
          }));
        })
        .on('mouseleave', function () {
          d3.select(this)
            .attr('filter', null)
            .attr('stroke-width', 1);
          setTooltipData((prev) => ({ ...prev, visible: false }));
        })
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.estimatedHours))
        .attr('height', (d) => height - yScale(d.estimatedHours));

      // Value label on Estimated bar
      certGroups
        .append('text')
        .attr('class', 'label-estimated')
        .attr('x', () => (x1Scale('estimated') || 0) + x1Scale.bandwidth() / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', isLight ? '#4338ca' : '#a5b4fc')
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => Math.max(12, yScale(d.estimatedHours) - 4))
        .text((d) => `${d.estimatedHours}h`);

      // 2. Hours Spent Bar (Emerald)
      certGroups
        .append('rect')
        .attr('class', 'bar-spent')
        .attr('x', () => x1Scale('spent') || 0)
        .attr('width', x1Scale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', 'url(#d3-spent-grad)')
        .attr('stroke', isLight ? '#047857' : '#34d399')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          d3.select(this)
            .attr('filter', 'url(#d3-bar-shadow)')
            .attr('stroke-width', 2);
          setTooltipData({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            cert: d,
          });
        })
        .on('mousemove', function (event) {
          setTooltipData((prev) => ({
            ...prev,
            x: event.clientX,
            y: event.clientY,
          }));
        })
        .on('mouseleave', function () {
          d3.select(this)
            .attr('filter', null)
            .attr('stroke-width', 1);
          setTooltipData((prev) => ({ ...prev, visible: false }));
        })
        .transition()
        .duration(700)
        .delay(100)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.hoursSpent))
        .attr('height', (d) => height - yScale(d.hoursSpent));

      // Value label on Spent bar
      certGroups
        .append('text')
        .attr('class', 'label-spent')
        .attr('x', () => (x1Scale('spent') || 0) + x1Scale.bandwidth() / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', isLight ? '#047857' : '#6ee7b7')
        .transition()
        .duration(700)
        .delay(100)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => Math.max(12, yScale(d.hoursSpent) - 4))
        .text((d) => (d.hoursSpent > 0 ? `${d.hoursSpent}h` : '0h'));

    } else {
      // BULLET / OVERLAPPING MODE: Wide background bar (Estimated) + Inner Solid Bar (Spent)
      const certGroups = g
        .selectAll('.cert-group')
        .data(processedData)
        .enter()
        .append('g')
        .attr('class', 'cert-group')
        .attr('transform', (d) => `translate(${x0Scale(d.code)},0)`);

      const barWidth = x0Scale.bandwidth();
      const innerBarWidth = Math.max(16, barWidth * 0.58);

      // 1. Estimated Outer Container Bar
      certGroups
        .append('rect')
        .attr('class', 'bullet-est')
        .attr('x', 0)
        .attr('width', barWidth)
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 6)
        .attr('fill', 'url(#d3-bullet-bg)')
        .attr('stroke', isLight ? '#a5b4fc' : '#4338ca')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,2')
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          setTooltipData({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            cert: d,
          });
        })
        .on('mousemove', function (event) {
          setTooltipData((prev) => ({
            ...prev,
            x: event.clientX,
            y: event.clientY,
          }));
        })
        .on('mouseleave', function () {
          setTooltipData((prev) => ({ ...prev, visible: false }));
        })
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.estimatedHours))
        .attr('height', (d) => height - yScale(d.estimatedHours));

      // Target Line at the top of Estimated
      certGroups
        .append('line')
        .attr('x1', -2)
        .attr('x2', barWidth + 2)
        .attr('y1', height)
        .attr('y2', height)
        .attr('stroke', isLight ? '#4338ca' : '#a5b4fc')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('y1', (d) => yScale(d.estimatedHours))
        .attr('y2', (d) => yScale(d.estimatedHours));

      // Label for target
      certGroups
        .append('text')
        .attr('x', barWidth / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', isLight ? '#4338ca' : '#a5b4fc')
        .transition()
        .duration(700)
        .attr('y', (d) => Math.max(12, yScale(d.estimatedHours) - 6))
        .text((d) => `Meta: ${d.estimatedHours}h`);

      // 2. Spent Inner Progress Bar (Emerald)
      certGroups
        .append('rect')
        .attr('class', 'bullet-spent')
        .attr('x', (barWidth - innerBarWidth) / 2)
        .attr('width', innerBarWidth)
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', 'url(#d3-spent-grad)')
        .attr('stroke', isLight ? '#047857' : '#34d399')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          setTooltipData({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            cert: d,
          });
        })
        .on('mousemove', function (event) {
          setTooltipData((prev) => ({
            ...prev,
            x: event.clientX,
            y: event.clientY,
          }));
        })
        .on('mouseleave', function () {
          setTooltipData((prev) => ({ ...prev, visible: false }));
        })
        .transition()
        .duration(700)
        .delay(120)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.hoursSpent))
        .attr('height', (d) => height - yScale(d.hoursSpent));

      // Value label on Spent inner bar
      certGroups
        .append('text')
        .attr('x', barWidth / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'black')
        .attr('fill', isLight ? '#065f46' : '#a7f3d0')
        .transition()
        .duration(700)
        .delay(120)
        .attr('y', (d) => (d.hoursSpent > 10 ? yScale(d.hoursSpent) + 14 : yScale(d.hoursSpent) - 4))
        .text((d) => (d.hoursSpent > 0 ? `${d.hoursSpent}h` : ''));
    }
  }, [processedData, chartMode, isLight]);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200 relative select-none ${
        isLight
          ? 'bg-gradient-to-br from-white via-indigo-50/30 to-sky-50/40 border-indigo-300 shadow-xl shadow-indigo-950/5'
          : 'bg-gradient-to-br from-[#0c142e] via-[#101938] to-[#0c142e] border-indigo-500/60 shadow-2xl shadow-black/60'
      }`}
    >
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-200/70 dark:border-indigo-900/60">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md ${
              isLight
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/30'
                : 'bg-indigo-500 border-indigo-300 text-white shadow-indigo-500/40'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-indigo-950' : 'text-white'}`}>
                Distribuição de Carga Horária (D3.js)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-400/40">
                Horas Estudadas vs Estimadas
              </span>
            </div>
            <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Visualização gráfica interativa da distribuição e do ritmo de estudo por certificação
            </p>
          </div>
        </div>

        {/* Action Controls: Mode & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode switch */}
          <div
            className={`p-1 rounded-xl border flex items-center gap-1 ${
              isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}
          >
            <button
              onClick={() => setChartMode('grouped')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === 'grouped'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-indigo-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizar em barras agrupadas lado a lado"
            >
              Barras Lado a Lado
            </button>
            <button
              onClick={() => setChartMode('bullet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === 'bullet'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-indigo-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizar em barras sobrepostas (Progresso vs Meta)"
            >
              Meta vs Real
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition ${
                isLight
                  ? 'bg-white border-indigo-200 text-slate-800 focus:border-indigo-500'
                  : 'bg-slate-900 border-slate-700 text-slate-200 focus:border-indigo-500'
              }`}
            >
              <option value="default">Ordem Padrão</option>
              <option value="estimatedHours">Maior Carga Estimada</option>
              <option value="hoursSpent">Mais Estudadas Primeiro</option>
              <option value="progress">Maior % Concluído</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition ${
                isLight
                  ? 'bg-white border-purple-200 text-slate-800 focus:border-purple-500'
                  : 'bg-slate-900 border-slate-700 text-slate-200 focus:border-purple-500'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Todas' ? 'Todas Categorias' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div
          className={`p-3 rounded-xl border flex items-center gap-3 ${
            isLight
              ? 'bg-white/90 border-indigo-200 shadow-2xs'
              : 'bg-[#121938] border-indigo-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-base sm:text-lg font-black font-mono leading-none ${isLight ? 'text-indigo-950' : 'text-white'}`}>
              {metrics.totalEstimated}h
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Carga Estimada
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-3 ${
            isLight
              ? 'bg-white/90 border-emerald-200 shadow-2xs'
              : 'bg-[#0f2420] border-emerald-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-base sm:text-lg font-black font-mono leading-none ${isLight ? 'text-emerald-950' : 'text-white'}`}>
              {metrics.totalSpent}h
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Horas Estudadas
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-3 ${
            isLight
              ? 'bg-white/90 border-amber-200 shadow-2xs'
              : 'bg-[#291e10] border-amber-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-base sm:text-lg font-black font-mono leading-none ${isLight ? 'text-amber-950' : 'text-white'}`}>
              {metrics.totalRemaining}h
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Horas Restantes
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-3 ${
            isLight
              ? 'bg-white/90 border-purple-200 shadow-2xs'
              : 'bg-[#201538] border-purple-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-base sm:text-lg font-black font-mono leading-none ${isLight ? 'text-purple-950' : 'text-white'}`}>
              {metrics.overallProgress}%
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Conclusão Geral
            </div>
          </div>
        </div>
      </div>

      {/* D3 SVG Chart Container */}
      <div className="w-full overflow-x-auto py-2">
        <svg ref={svgRef} className="mx-auto block" />
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/40 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-b from-indigo-500 to-indigo-700 border border-indigo-400 shadow-2xs" />
            <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Horas Estimadas (Planejadas)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-b from-emerald-400 to-emerald-600 border border-emerald-400 shadow-2xs" />
            <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Horas Estudadas (Realizadas)
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Passe o mouse sobre as barras para ver detalhes completos de cada certificação</span>
        </div>
      </div>

      {/* Floating D3 Tooltip */}
      {tooltipData.visible && tooltipData.cert && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y - 10}px`,
          }}
        >
          <div
            className={`p-3.5 rounded-xl border-2 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[220px] ${
              isLight
                ? 'bg-white/95 border-indigo-400 text-slate-900 shadow-indigo-950/20'
                : 'bg-[#0f1738]/95 border-indigo-500 text-white shadow-black/80'
            }`}
          >
            <div className="border-b pb-1.5 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
                  {tooltipData.cert.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                  {tooltipData.cert.category}
                </span>
              </div>
              <div className="font-extrabold text-[13px] leading-snug mt-0.5 truncate">
                {tooltipData.cert.title}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {tooltipData.cert.issuer}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-sans font-bold">
                  Estudadas
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {tooltipData.cert.hoursSpent}h
                </div>
              </div>

              <div className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-[10px] text-indigo-700 dark:text-indigo-300 font-sans font-bold">
                  Estimadas
                </div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {tooltipData.cert.estimatedHours}h
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] font-medium border-t border-slate-200 dark:border-slate-800">
              <span>Progresso Real:</span>
              <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                {tooltipData.cert.estimatedHours > 0
                  ? Math.round((tooltipData.cert.hoursSpent / tooltipData.cert.estimatedHours) * 100)
                  : 0}
                %
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium">
              <span>Status:</span>
              <span
                className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                  tooltipData.cert.status === 'Concluída'
                    ? 'bg-emerald-500/20 text-emerald-600'
                    : tooltipData.cert.status === 'Em Andamento'
                    ? 'bg-sky-500/20 text-sky-600'
                    : 'bg-slate-500/20 text-slate-500'
                }`}
              >
                {tooltipData.cert.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
