import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TrackSubcategory } from '../types';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Hourglass,
  ArrowUpDown,
  Sparkles,
  Info,
  X
} from 'lucide-react';

export interface ModuleChartItem {
  id: string;
  code: string;
  title: string;
  estimatedHours: number;
  hoursSpent: number;
  completedPercent: number;
  status: string;
}

interface TrackModulesD3ChartProps {
  trackTitle: string;
  subcategories: TrackSubcategory[];
  notes?: { subcategoryId?: string; studyHours?: number; studyPercent?: number }[];
  onClose?: () => void;
  theme?: 'light' | 'dark';
}

type SortOption = 'default' | 'hoursSpent' | 'estimatedHours' | 'progress';
type ChartMode = 'grouped' | 'bullet';

export const TrackModulesD3Chart: React.FC<TrackModulesD3ChartProps> = ({
  trackTitle,
  subcategories,
  notes = [],
  onClose,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [chartMode, setChartMode] = useState<ChartMode>('grouped');
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: ModuleChartItem | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  // Transform subcategories into chart items factoring notes and abatements
  const processedData: ModuleChartItem[] = useMemo(() => {
    const list: ModuleChartItem[] = (subcategories || []).map((sub, idx) => {
      const subNotes = notes.filter((n) => n.subcategoryId === sub.id);
      const notesHrs = subNotes.reduce((acc, n) => acc + (n.studyHours || 0), 0);
      const notesPct = subNotes.reduce((acc, n) => acc + (n.studyPercent || 0), 0);
      const effHours = Math.max(sub.hoursSpent || 0, notesHrs);
      const estHours = sub.estimatedHours || 40;
      const hoursPct = estHours > 0 ? Math.round((effHours / estHours) * 100) : 0;
      const subItems = sub.items?.length || 0;
      const subDone = sub.items?.filter((i) => i.status === 'Concluído').length || 0;
      const itemsPct = subItems > 0 ? Math.round((subDone / subItems) * 100) : 0;

      const completedPercent = Math.min(
        100,
        Math.max(sub.completedPercent ?? 0, hoursPct, notesPct, itemsPct)
      );

      return {
        id: sub.id,
        code: `MOD ${String(idx + 1).padStart(2, '0')}`,
        title: sub.title,
        estimatedHours: estHours,
        hoursSpent: Number(effHours.toFixed(1)),
        completedPercent,
        status: sub.status || 'Planejada',
      };
    });

    switch (sortOption) {
      case 'hoursSpent':
        return [...list].sort((a, b) => b.hoursSpent - a.hoursSpent);
      case 'estimatedHours':
        return [...list].sort((a, b) => b.estimatedHours - a.estimatedHours);
      case 'progress':
        return [...list].sort((a, b) => b.completedPercent - a.completedPercent);
      default:
        return list;
    }
  }, [subcategories, notes, sortOption]);

  // Overall metrics
  const metrics = useMemo(() => {
    const totalEstimated = processedData.reduce((acc, c) => acc + c.estimatedHours, 0);
    const totalSpent = processedData.reduce((acc, c) => acc + c.hoursSpent, 0);
    const totalRemaining = Math.max(0, totalEstimated - totalSpent);
    const overallProgress = totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0;
    return {
      totalEstimated,
      totalSpent: Number(totalSpent.toFixed(1)),
      totalRemaining: Number(totalRemaining.toFixed(1)),
      overallProgress,
    };
  }, [processedData]);

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 25, right: 30, bottom: 65, left: 55 };
    const width = Math.max(480, containerWidth) - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const defs = svg.append('defs');

    // Electric Cyan gradient for Spent Hours
    const spentGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-mod-spent-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    spentGrad.append('stop').attr('offset', '0%').attr('stop-color', '#00F0FF');
    spentGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0098A6');

    // Cyber Slate/White gradient for Estimated Hours
    const estGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-mod-est-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    estGrad.append('stop').attr('offset', '0%').attr('stop-color', isLight ? '#94a3b8' : '#334155');
    estGrad.append('stop').attr('offset', '100%').attr('stop-color', isLight ? '#64748b' : '#1e293b');

    // Bullet bg track
    const bulletBgGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-mod-bullet-bg')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    bulletBgGrad.append('stop').attr('offset', '0%').attr('stop-color', isLight ? '#e2e8f0' : '#141417');
    bulletBgGrad.append('stop').attr('offset', '100%').attr('stop-color', isLight ? '#cbd5e1' : '#0C0C0E');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (processedData.length === 0) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#00F0FF')
        .attr('font-size', '13px')
        .attr('font-family', 'monospace')
        .text('Nenhum módulo encontrado nesta trilha.');
      return;
    }

    const x0Scale = d3
      .scaleBand()
      .domain(processedData.map((d) => d.code))
      .range([0, width])
      .padding(0.28);

    const maxHours = d3.max(processedData, (d) => Math.max(d.estimatedHours, d.hoursSpent, 10)) || 50;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxHours * 1.15])
      .nice()
      .range([height, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', isLight ? '#e2e8f0' : 'rgba(0, 240, 255, 0.12)')
      .attr('stroke-dasharray', '2,4');

    g.select('.grid-lines .domain').remove();

    // Axes
    const xAxis = d3.axisBottom(x0Scale);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}h`);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', isLight ? '#cbd5e1' : 'rgba(0, 240, 255, 0.35)');

    xAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#1e293b' : '#00F0FF')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').attr('stroke', isLight ? '#cbd5e1' : 'rgba(0, 240, 255, 0.35)');

    yAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#475569' : 'rgba(255, 255, 255, 0.6)')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    if (chartMode === 'grouped') {
      const x1Scale = d3
        .scaleBand()
        .domain(['estimated', 'spent'])
        .range([0, x0Scale.bandwidth()])
        .padding(0.12);

      const moduleGroups = g
        .selectAll('.module-group')
        .data(processedData)
        .enter()
        .append('g')
        .attr('class', 'module-group')
        .attr('transform', (d) => `translate(${x0Scale(d.code)},0)`);

      // Estimated hours bar
      moduleGroups
        .append('rect')
        .attr('x', x1Scale('estimated') || 0)
        .attr('width', x1Scale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 2)
        .attr('fill', 'url(#d3-mod-est-grad)')
        .attr('stroke', isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.2)')
        .attr('stroke-width', 1)
        .transition()
        .duration(650)
        .attr('y', (d) => yScale(d.estimatedHours))
        .attr('height', (d) => Math.max(0, height - yScale(d.estimatedHours)));

      // Spent hours bar (Electric Cyan with glow)
      moduleGroups
        .append('rect')
        .attr('x', x1Scale('spent') || 0)
        .attr('width', x1Scale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 2)
        .attr('fill', 'url(#d3-mod-spent-grad)')
        .attr('stroke', '#00F0FF')
        .attr('stroke-width', 1.2)
        .style('filter', 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.5))')
        .transition()
        .duration(650)
        .attr('y', (d) => yScale(d.hoursSpent))
        .attr('height', (d) => Math.max(0, height - yScale(d.hoursSpent)));

      // Hover overlay trigger
      moduleGroups
        .append('rect')
        .attr('x', 0)
        .attr('width', x0Scale.bandwidth())
        .attr('y', 0)
        .attr('height', height)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          const [pointerX, pointerY] = d3.pointer(event, containerRef.current);
          setTooltipData({
            visible: true,
            x: pointerX,
            y: pointerY,
            item: d,
          });
        })
        .on('mousemove', (event, d) => {
          const [pointerX, pointerY] = d3.pointer(event, containerRef.current);
          setTooltipData((prev) => ({
            ...prev,
            x: pointerX,
            y: pointerY,
            item: d,
          }));
        })
        .on('mouseleave', () => {
          setTooltipData((prev) => ({ ...prev, visible: false, item: null }));
        });
    } else {
      // Bullet / Overlap Mode: Estimated background track + Cyan progress fill
      const moduleGroups = g
        .selectAll('.module-group-bullet')
        .data(processedData)
        .enter()
        .append('g')
        .attr('class', 'module-group-bullet')
        .attr('transform', (d) => `translate(${x0Scale(d.code)},0)`);

      const barWidth = x0Scale.bandwidth();

      // Background estimated track
      moduleGroups
        .append('rect')
        .attr('x', 0)
        .attr('width', barWidth)
        .attr('y', (d) => yScale(d.estimatedHours))
        .attr('height', (d) => Math.max(0, height - yScale(d.estimatedHours)))
        .attr('rx', 2)
        .attr('fill', 'url(#d3-mod-bullet-bg)')
        .attr('stroke', 'rgba(0, 240, 255, 0.35)')
        .attr('stroke-width', 1);

      // Cyan fill of hours spent inside track
      moduleGroups
        .append('rect')
        .attr('x', 2)
        .attr('width', Math.max(0, barWidth - 4))
        .attr('y', height)
        .attr('height', 0)
        .attr('rx', 2)
        .attr('fill', 'url(#d3-mod-spent-grad)')
        .attr('stroke', '#00F0FF')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.5))')
        .transition()
        .duration(650)
        .attr('y', (d) => yScale(Math.min(d.estimatedHours, d.hoursSpent)))
        .attr('height', (d) =>
          Math.max(0, height - yScale(Math.min(d.estimatedHours, d.hoursSpent)))
        );

      // Trigger overlay
      moduleGroups
        .append('rect')
        .attr('x', 0)
        .attr('width', barWidth)
        .attr('y', 0)
        .attr('height', height)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          const [pointerX, pointerY] = d3.pointer(event, containerRef.current);
          setTooltipData({
            visible: true,
            x: pointerX,
            y: pointerY,
            item: d,
          });
        })
        .on('mousemove', (event, d) => {
          const [pointerX, pointerY] = d3.pointer(event, containerRef.current);
          setTooltipData((prev) => ({
            ...prev,
            x: pointerX,
            y: pointerY,
            item: d,
          }));
        })
        .on('mouseleave', () => {
          setTooltipData((prev) => ({ ...prev, visible: false, item: null }));
        });
    }
  }, [processedData, chartMode, isLight]);

  return (
    <div
      ref={containerRef}
      className={`border-[1.5px] p-4 sm:p-5 transition-all duration-200 relative select-none animate-fadeIn ${
        isLight
          ? 'rounded-2xl bg-white border-slate-300 shadow-xl'
          : 'technical-card border-[#00F0FF]/40 bg-[#141417] shadow-[0_4px_30px_rgba(0,0,0,0.7)]'
      }`}
    >
      {/* Header with Title, Mode switcher, Sort and Close button */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b-[1.5px] ${
        isLight ? 'border-slate-200' : 'border-[#00F0FF]/25'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#00F0FF]/40 bg-[#0C0C0E] text-[#00F0FF] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="label-tech text-[#00F0FF]">D3_ANALYTICS // WORKLOAD</span>
              <span className="text-[10px] font-mono px-2 py-0.5 font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/40">
                Horas Estudadas vs Estimadas
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-['Syne',sans-serif] tracking-tight">
              Distribuição de Carga Horária dos Módulos · {trackTitle}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {/* Mode switch */}
          <div className="p-0.5 border border-[#00F0FF]/30 bg-[#0C0C0E] flex items-center">
            <button
              onClick={() => setChartMode('grouped')}
              className={`px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                chartMode === 'grouped'
                  ? 'bg-[#00F0FF] text-[#0C0C0E]'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Visualizar em barras lado a lado"
            >
              Barras Lado a Lado
            </button>
            <button
              onClick={() => setChartMode('bullet')}
              className={`px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                chartMode === 'bullet'
                  ? 'bg-[#00F0FF] text-[#0C0C0E]'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Visualizar em barras sobrepostas (Meta vs Real)"
            >
              Meta vs Real
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#00F0FF]" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="text-xs font-bold px-2.5 py-1 border border-[#00F0FF]/30 bg-[#0C0C0E] text-[#00F0FF] focus:border-[#00F0FF] cursor-pointer outline-none"
            >
              <option value="default">Ordem dos Módulos</option>
              <option value="estimatedHours">Maior Carga Prevista</option>
              <option value="hoursSpent">Mais Estudados Primeiro</option>
              <option value="progress">Maior % Concluído</option>
            </select>
          </div>

          {/* Close Chart Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-[#00F0FF]/30 hover:border-rose-400 text-white/50 hover:text-rose-400 bg-[#0C0C0E] cursor-pointer transition ml-1"
              title="Fechar gráfico de carga horária"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards Grid in Technical Dark OS style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 font-mono">
        <div className="stat-item border border-[#00F0FF]/25 p-2.5 flex items-center gap-2.5 bg-[#0C0C0E]">
          <div className="w-7 h-7 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="stat-value text-base font-bold text-white leading-none">
              {metrics.totalEstimated}h
            </div>
            <div className="label-tech text-[10px] mt-0.5">
              Carga Estimada
            </div>
          </div>
        </div>

        <div className="stat-item border border-[#00F0FF]/25 p-2.5 flex items-center gap-2.5 bg-[#0C0C0E]">
          <div className="w-7 h-7 bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="stat-value text-base font-bold text-[#00F0FF] leading-none">
              {metrics.totalSpent}h
            </div>
            <div className="label-tech text-[10px] mt-0.5">
              Horas Estudadas
            </div>
          </div>
        </div>

        <div className="stat-item border border-[#00F0FF]/25 p-2.5 flex items-center gap-2.5 bg-[#0C0C0E]">
          <div className="w-7 h-7 bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Hourglass className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="stat-value text-base font-bold text-amber-400 leading-none">
              {metrics.totalRemaining}h
            </div>
            <div className="label-tech text-[10px] mt-0.5">
              Horas Restantes
            </div>
          </div>
        </div>

        <div className="stat-item border border-[#00F0FF]/25 p-2.5 flex items-center gap-2.5 bg-[#0C0C0E]">
          <div className="w-7 h-7 bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="stat-value text-base font-bold text-white leading-none">
              {metrics.overallProgress}%
            </div>
            <div className="label-tech text-[10px] mt-0.5">
              Evolução da Trilha
            </div>
          </div>
        </div>
      </div>

      {/* D3 SVG Chart Container */}
      <div className="w-full overflow-x-auto py-2">
        <svg ref={svgRef} className="mx-auto block" />
      </div>

      {/* Chart Legend & Help Tip */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t-[1.5px] font-mono text-xs ${
        isLight ? 'border-slate-200 text-slate-700' : 'border-[#00F0FF]/25 text-white/70'
      }`}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-slate-600 border border-white/20" />
            <span className="font-bold">Horas Previstas (Módulo)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#00F0FF] border border-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <span className="font-bold text-[#00F0FF]">Horas Realizadas (+Abatimentos)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <Info className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
          <span>Passe o mouse sobre as barras para ver os detalhes e % de cada módulo</span>
        </div>
      </div>

      {/* Floating D3 Tooltip */}
      {tooltipData.visible && tooltipData.item && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y - 10}px`,
          }}
        >
          <div className="p-3 border border-[#00F0FF] bg-[#0C0C0E]/95 shadow-[0_0_24px_rgba(0,240,255,0.4)] text-xs font-mono min-w-[230px] space-y-1.5 text-white">
            <div className="border-b border-[#00F0FF]/30 pb-1 flex items-center justify-between">
              <span className="font-bold text-[#00F0FF]">{tooltipData.item.code}</span>
              <span className="px-1.5 py-0.2 bg-[#00F0FF]/15 text-[#00F0FF] text-[10px] font-bold border border-[#00F0FF]/30">
                {tooltipData.item.status}
              </span>
            </div>
            <div className="font-bold text-white text-xs truncate">
              {tooltipData.item.title}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
              <div>
                <span className="text-white/40 block text-[10px]">REALIZADO:</span>
                <span className="font-bold text-[#00F0FF]">{tooltipData.item.hoursSpent}h</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">PREVISTO:</span>
                <span className="font-bold text-white/80">{tooltipData.item.estimatedHours}h</span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-400 font-bold pt-0.5">
              EVOLUÇÃO TOTAL: {tooltipData.item.completedPercent}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
