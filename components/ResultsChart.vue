<template>
	<div class="w-full relative">
		<v-chart
			class="chart"
			:option="option"
			autoresize
			@mousemove="onMouseMove"
		/>
		<div
			class="absolute top-1/2 right-0 transform -translate-y-1/2 -mt-4 translate-x-2 text-[11px] text-[#666] rotate-90"
		>
			Errors
		</div>
	</div>
</template>

<script setup>
import * as echarts from 'echarts';
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';

use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

const props = defineProps({
	data: Object,
});

const formatTooltip = (params) => {
	const dataIndex = params[0].dataIndex;
	const wpm = props.data.wpm[dataIndex];
	const raw = props.data.raw[dataIndex];
	const error =
		params.length === 3
			? params[0].data[1]
			: props.data.error[dataIndex]; // Use params[2].data[1] if error point exists
	const time = params[0].data[2] || props.data.time[dataIndex];
	return `
    <div class="bg-neutral-800/70 w-32 rounded-lg border backdrop-blur text-neutral-100 border-neutral-700/70 pt-1 text-sm flex flex-col overflow-clip">
	<div class="px-2 flex gap-2 items-center border-b tracking-wide border-neutral-700/70 text-sm text-neutral-300"><div class="flex items-center justify-between flex-grow font-mono">${time}</div></div>
	<div class="bg-neutral-800 px-2 flex gap-2 items-center pt-1 items-center"><div class="h-2 w-2 bg-[#6BD968] rounded-full"></div><div class="flex items-center justify-between flex-grow"><div class="text-neutral-400 tracking-wide text-[13px]">wpm</div><div class="tabular-nums font-mono tracking-wide">${wpm.toFixed(
		2
	)}</div></div></div>
	<div class="bg-neutral-800 px-2 flex gap-2 items-center"><div class="h-2 w-2 bg-[#525252] rounded-full"></div><div class="flex items-center justify-between flex-grow"><div class="text-neutral-400 tracking-wide text-[13px]">raw</div><div class="tabular-nums font-mono tracking-wide">${raw.toFixed(
		2
	)}</div></div></div>
	<div class="bg-neutral-800 px-2 flex gap-2 items-center pb-1"><div class="h-2 w-2 bg-[#F44250] rounded-full"></div><div class="flex items-center justify-between flex-grow"><div class="text-neutral-400 tracking-wide text-[13px]">error</div><div class="tabular-nums font-mono tracking-wide">${error}</div></div></div>
    </div>
  `;
};

const option = computed(() => ({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			show: false,
			animation: false,
			type: 'line', // Use line axisPointer
			axis: 'x', // Set the axis to 'y' for a horizontal line
			lineStyle: {
				show: false,
				color: 'transparent',
			},
		},
		formatter: formatTooltip,
		backgroundColor: 'transparent', // Set the background color to transparent
		extraCssText: `
    box-shadow: none;
    border: none;
    padding: 0;
  `,
		borderWidth: 0,
		padding: 0,
	},
	grid: {
		top: '10%',
		bottom: '13%',
		left: '6.5%',
		right: '4%',
		containLabels: true,
	},
	xAxis: {
		type: 'value',
		axisLabel: {
			color: '#888',
		},
		axisLine: {
			lineStyle: {
				color: '#333',
			},
		},
		splitLine: {
			show: true,
			lineStyle: {
				color: '#262626',
			},
		},
		boundryGaps: false,
		min: 1,
		max: parseFloat(props.data.time[props.data.time.length - 1]),
	},
	yAxis: [
		{
			type: 'value',
			position: 'left',
			axisLabel: {
				color: '#666',
			},
			axisLine: {
				lineStyle: {
					color: '#333',
				},
			},
			splitLine: {
				lineStyle: {
					color: '#262626',
				},
			},
			splitNumber: 3,
			name: 'Words per minute',
			nameLocation: 'center',
			nameGap: 40,
			nameTextStyle: {
				fontSize: 11,
				color: '#666',
				fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
			},
		},
		{
			type: 'value',
			position: 'right',
			axisLabel: {
				color: '#666',
				formatter: function (value) {
					if (Number.isInteger(value)) {
						return value;
					}
				},
			},
			axisLine: {
				lineStyle: {
					color: '#333',
				},
			},
			splitLine: {
				show: false,
			},
			splitNumber: 3,
			max: Math.max(...props.data.error),
		},
	],
	series: [
		{
			name: 'Errors',
			type: 'scatter',
			yAxisIndex: 1,
			z: 10,
			data: props.data.error
				.map((value, index) =>
					value > 0
						? [
								parseFloat(
									props
										.data
										.time[
										index
									]
								), // Use the corresponding time value instead of index + 1
								value,
								props.data.time[
									index
								],
						  ]
						: null
				)
				.filter((item) => item !== null), // Remove null values from the array
			itemStyle: {
				color: '#F44250',
			},
			emphasis: {
				symbolSize: 18,
			},
			symbol: 'image://./x.png',
			symbolSize: 10,
		},
		{
			name: 'Raw',
			type: 'line',
			data: props.data.raw.map((value, index) => [
				parseFloat(props.data.time[index]), // Use the corresponding time value instead of index + 1
				value,
			]),
			color: '#888',
			smooth: true,
			areaStyle: {
				color: '#202020',
			},
			lineStyle: {
				width: 2,
			},
			symbol: 'circle',
			symbolSize: 6,
			itemStyle: {
				color: '#525252',
			},
			emphasis: {
				areaStyle: {
					color: '#202020',
				},
				itemStyle: {
					borderWidth: 2,
					borderColor: '#525252',
				},
				symbol: 'circle',
				symbolSize: 30,
			},
		},
		{
			name: 'WPM',
			type: 'line',
			data: props.data.wpm.map((value, index) => [
				parseFloat(props.data.time[index]), // Use the corresponding time value instead of index + 1
				value,
			]),
			color: '#6BD968',
			smooth: true,
			lineStyle: {
				width: 2,
			},
			symbol: 'circle',
			symbolSize: 6,
			itemStyle: {
				color: '#6BD968',
			},
			emphasis: {
				itemStyle: {
					borderWidth: 2,
					borderColor: '#6BD968',
				},
				symbol: 'circle',
				symbolSize: 30,
			},
		},
	],
}));
</script>

<style>
.chart {
	height: 175px;
	width: 100%;
}
x-vue-echarts {
	width: 100%;
}
</style>
