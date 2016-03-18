'use strict';

// Set moment.js to use locale as "Spanish"
moment.locale('es');

var dataCount = dc.dataCount('#dataCount');
var eventsVis = dc.rowChart("#eventsVis");
var yearVis = dc.rowChart("#yearVis");
var monthsVis = dc.rowChart("#monthsVis");
var timeLineVis = dc.lineChart("#timeLineVis");
var timeLineRangeVis = dc.barChart('#timeLineRangeVis');
var mapVis = dc_leaflet.markerChart("#map");

var events = [
				"ACCIDENTE DE TRANSITO",
				"ATENCION MEDICA A PARTURIENTAS",
				"ATENCION MEDICA EN COMISARIAS",
				"ATENCION MEDICA EN DOMICILIOS",
				"ATENCION MEDICA EN ESCUELAS",
				"ATENCION MEDICA EN UNIDADES SANITARIAS",
				"ATENCION MEDICA EN VIA PUBLICA",
				"RECLAMOS POR ARBOLES CAIDOS O RAMAS",
				"RECLAMOS POR BACHES EN VIA PUBLICA",
				"RECLAMOS POR HUMO EN BAHIA BLANCA",
				"RECLAMOS POR HUMO EN ZONA INDUSTRIAL",
				"RECLAMOS POR OLORES EN BAHIA BLANCA",
				"RECLAMOS POR OLORES EN ZONA INDUSTRIAL",
				"RECLAMOS POR RUIDOS DE SIRENA EN EL POLO INDUSTRIAL",
				"RECLAMOS POR TALA DE ARBOLES",
				"SOLICITUD DE AMBULANCIA DESDE HOSPITALES",
				"SUSTANCIAS PELIGROSAS - DCPBA - DERRAME QUIMICO",
				"SUSTANCIAS PELIGROSAS - DCPBA - ESCAPE DE GAS",
				"SUSTANCIAS PELIGROSAS - RESIDUOS PATOGENICOS",
				"TRASLADOS INTERHOSPITALARIOS"
			];

var months = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];

var ndx,
	globalData = {},
	firstYear = 2007,
	lastYear = 2016;

function expandDataAndSaveInGlobal(data, year) {
	data.forEach(function (d) {
		d.parseDate = new Date(d.fecha);
		d.month = d3.time.month(d.parseDate);
		d.day = d3.time.day(d.parseDate);
		d.year = d.parseDate.getFullYear();
	});

	globalData[year] = data;
}

function initializeYearsVisualization(xfilter) {
    var yearDimension = xfilter.dimension(function (d) {
        return d.year;
    });
    var yearGroup = yearDimension.group();

    yearVis
        .width($('#yearVis').parent().width())
        .height(400)
        .margins({top: 10, right: 10, bottom: 30, left: 10})
        .dimension(yearDimension)
        .group(yearGroup)
        .label(function (d) {
            return d.key + ' : ' + d.value.toLocaleString();
        })
        .colors(function() {
            return "#1F77B4";
        })
        .elasticX(true);

    yearVis.xAxis()
        .ticks(5);
}

function initializeMonthsVisualization(xfilter) {
    var monthDimension = xfilter.dimension(function (d) {
        return d.parseDate.getMonth();
    });

    var monthGroup = monthDimension.group();

    monthsVis
        .width($('#monthsVis').parent().width())
        .height(400)
        .margins({top: 10, right: 10, bottom: 30, left: 10})
        .dimension(monthDimension)
        .group(monthGroup)
        .label(function (d) {
            return months[d.key] + ' : ' + d.value.toLocaleString();
        })
        .colorAccessor(function () {
            return "blue";
        })
        .elasticX(true);

    monthsVis.xAxis()
        .ticks(4);
}

function initializeEventsVisualization(xfilter) {
    var eventDimension = xfilter.dimension(function (d) {
        return events[d.evento];
    });

    var eventGroup = eventDimension.group();

    eventsVis
        .width($('#eventsVis').parent().width())
        .height(400)
        .margins({top: 10, right: 10, bottom: 30, left: 10})
        .dimension(eventDimension)
        .group(eventGroup)
        .label(function (d) {
            return d.key + ' : ' + d.value.toLocaleString();
        })
        .title(function (d) {
            return d.value;
        })
        .ordering(function (d) {
            return -d.value;
        })
        .elasticX(true)
        .on("filtered", function (chart, filter) {
            var color = "#000000";
            if (eventsVis.filters().length == 1) {
                color = eventsVis.colors()(eventsVis.filter());
            }

            timeLineVis.colors(function () { return color; });
                timeLineRangeVis.colors(function () { return color; });
        })
        .colors(d3.scale.category20());
}

function initializeTimelineVisualization(xfilter) {
    var dayDimension = xfilter.dimension(function (instance) {
        return instance.day;
    });

    var dayGroup = dayDimension.group();

    var firstDay = dayDimension.bottom(1)[0].day,
        lastDay = dayDimension.top(1)[0].day;

    timeLineVis
        .width($("#timeLineVis").parent().width())
        .margins({top: 20, right: 10, bottom: 20, left: 40})
        .renderArea(true)
        .x(d3.time.scale().domain([firstDay, lastDay]))
        .round(d3.time.day.round)
        .xUnits(d3.time.days)
        .brushOn(false)
        .renderDataPoints(true)
        .elasticY(true)
        .mouseZoomable(true)
        .dimension(dayDimension)
        .group(dayGroup)
        .rangeChart(timeLineRangeVis)
        .transitionDuration(500)
        .title(function (d) {
            return moment(d.key).format('DD/MM/YYYY') + " : " + d.value.toLocaleString();
        })
        .filterPrinter(function (filters) {
            var dateFormat = 'DD/MM/YYYY';
            var from = moment(filters[0][0]).format(dateFormat),
                to = moment(filters[0][1]).format(dateFormat);
            return "["+from+" -> "+to+"]";
        })
        .colors(function () { return "#000000"; })
        .xAxis().tickFormat(function (date) { 
            return date.getHours() == 0 && date.getMinutes() == 0 ? moment(date).format("DD MMM") : moment(date).format("hh a");
        });

    timeLineRangeVis
        .width($("#timeLineRangeVis").parent().width())
        .height(40)
        .margins({top: 0, right: 10, bottom: 20, left: 40})
        .dimension(dayDimension)
        .group(dayGroup)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([firstDay, lastDay]))
        .round(d3.time.day.round)
        .xUnits(d3.time.days)
        .alwaysUseRounding(true)
        .colors(function () { return "#000000"; })
        .elasticY(true)
        .xAxis().tickFormat(function (date) {
            var dateLabel;
            if (date.getHours() == 0 && date.getMinutes() == 0 && date.getDate() == 1 && date.getMonth() == 0) {
                dateLabel = date.getFullYear();
            } else if (date.getHours() == 0 && date.getMinutes() == 0) {
                dateLabel = moment(date).format("DD MMM");
            } else {
                dateLabel = moment(date).format("hh a");
            }

            return dateLabel;
        });
}

function initializeMapVisualization(xfilter) {
    var geoDimension = xfilter.dimension(function (d) { return d.lat+','+d.lng+'::'+d.evento+'::'+d.domicilio+'::'+d.fecha; });
    var geoGroup = geoDimension.group();
    
    mapVis
        .width($("#map").parent().width())
        .height(500)
        .dimension(geoDimension)
        .group(geoGroup)
        .locationAccessor(function (d) {
            return d.key.split(/::/g)[0];
        })
        .popup(function (d, marker) {
            var parts = d.key.split(/::/g);
            return events[parts[1]]+"<br/>"+parts[2]+"<br/>"+parts[3];
        })
        .center([-38.718318,-62.266348])
        .zoom(12)
        .cluster(true)
        .filterByArea(false)
        .brushOn(false);
}

d3.tsv("data/"+lastYear+".tsv", function (data) {

	expandDataAndSaveInGlobal(data, lastYear);

	ndx = crossfilter(globalData[lastYear]);
	var all = ndx.groupAll();

    // Initialize data counter
	dataCount
        .dimension(ndx)
        .group(all)
        .html({
            some: '<strong>%filter-count</strong> registros seleccionados de <strong>%total-count</strong>' +
                ' | <a class="btn btn-danger btn-xs" href="javascript:dc.filterAll(); dc.renderAll();">Limpiar todos los filtros</a>',
            all: 'Todos los registros seleccionados. Utilice las visualizaciones para aplicar filtros sobre los datos.'
        })
        .formatNumber(function (value) {
            return value;
        });

    // Initialize Visualizations
    initializeYearsVisualization(ndx);
    initializeMonthsVisualization(ndx);
    initializeEventsVisualization(ndx);
    initializeTimelineVisualization(ndx);
    initializeMapVisualization(ndx);

    // Render visualizations
	dc.renderAll();

    // Show headers and hide initial loading message
	$('.loading').hide();
	$('h4').show();
});

function searchDataFromYear(year, callback) {
	if (!globalData[year]) {
		d3.tsv("data/"+year+".tsv", function(data){
			expandDataAndSaveInGlobal(data, year);
			callback();
		});
	} else {
		callback();
	}
}

function clearAllFiltersAndRemoveData() {
	// Clean all visualizations filters to clean all data
	dc.filterAll();
	// Remove all data
	ndx.remove();
}

function refreshVisualizations() {
	var firstDay = timeLineVis.dimension().bottom(1)[0].day,
		lastDay = timeLineVis.dimension().top(1)[0].day;
	
	timeLineVis.x(d3.time.scale().domain([firstDay, lastDay]))
	timeLineRangeVis.x(d3.time.scale().domain([firstDay, lastDay]))

	dc.renderAll();
}

// Set listener to year selector
$("#yearSelector").on("change", function() {
	var year = $(this).val();

    var loadingModal = $('#loadingModal');
    loadingModal.modal("show");

    var alertAllYears = $('#alertAllYears');

	clearAllFiltersAndRemoveData();

	if (year === "all") {
        alertAllYears.show();

		var years = [];
		for (var y = firstYear; y < lastYear+1; y++) {
			years.push(y);
		}

		async.each(years, searchDataFromYear, function(err) {
			if (err) {
				console.error(err);
			} else {
				years.forEach(function (year) {
					ndx.add(globalData[year]);
				});
				mapVis.chartGroup("map");
				$("#refreshMapButton").show();
				refreshVisualizations();
            }
			loadingModal.modal("hide");
		});

	} else {
        alertAllYears.hide();
		searchDataFromYear(+year, function() {
			ndx.add(globalData[+year]);
			mapVis.chartGroup(null);
			$("#refreshMapButton").hide();
			refreshVisualizations();
			loadingModal.modal("hide");
		});
	}
});

// Activate all tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});
