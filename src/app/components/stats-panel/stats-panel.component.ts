import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { TitleBarComponent } from "../shared-components/title-bar/title-bar.component";
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [TitleBarComponent, TranslateModule, NgApexchartsModule, CommonModule],
  templateUrl: './stats-panel.component.html',
  styleUrls: ['./stats-panel.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StatsPanelComponent implements OnInit {
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Desktops",
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        height: 350,
        type: "line"
      },
      title: {
        text: "Product Trends by Month"
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep"
        ]
      }
    };

    console.log(this.chartOptions);
  }

  ngOnInit(): void {}
}
