<template>
  <v-app style="background:#FFF">
    <loading :active.sync="isLoading" 
    ></loading>
    <v-container fluid>
      <v-layout style="height:5%">
        <v-flex xs3>
          <v-select
            :items="countySet"
            v-model="county"
            @change="resumeStation()"
            menu-props="auto"
            label="Select"
            hide-details
            prepend-icon="map"
            single-line
          ></v-select>
        </v-flex>
        <v-flex xs3>
          <v-menu
            :close-on-content-click="false"
            v-model="modal1"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <v-text-field
              slot="activator"
              v-model="FromTime"
              label="從時間點 : "
              prepend-icon="event"
              readonly
            ></v-text-field>
            <v-date-picker v-model="FromTime" @change="changeTime()" type="month" @input="modal1 = false"></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs3 >
          <v-menu
            :close-on-content-click="false"
            v-model="modal2"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <v-text-field
              slot="activator"
              v-model="ToTime"
              label="到時間點"
              prepend-icon="event"
              readonly
            ></v-text-field>
            <v-date-picker v-model="ToTime" @change="changeTime()" type="month" @input="modal2 = false"></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex v-if="selectName!=''" xs3>
          <h1>目前選擇的點 : {{selectName}}</h1>
        </v-flex>
      </v-layout>
      <v-layout style="height:600px">
        <GmapMap
          :center="center"
          :zoom="12"
          :options="options"
          style="height:100%;width:100%"
          @rightclick="getThreeLocate($event)"
          @dblclick="resumeStation()"
        >
        <GmapMarker
          :key="index"
          v-for="(m, index) in filterCounty"
          :position="m.position"
          :clickable="true"
          @click="getChartData(m.Name)"
        />
        </GmapMap>
      </v-layout>
      <v-layout>
        <canvas  style="height:100px" id="planet-chart"></canvas>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import planetChartData from './chart-data.js';
import Chart from 'chart.js';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
  name: 'App',
  components:{
    Loading
  },
  data () {
    return {
      options:{"mapTypeControl":false,"streetViewControl":false,zoomControl:false},
      center:{lat:25,lng:121.5},
      AllStations:[],
      stations:[],
      countySet:[],
      county:"全部",
      FromTime:"2010-01",
      ToTime:"2018-09",
      modal1: false,
      modal2: false,
      chartData:[],
      planetChartData: planetChartData,
      setThree:false,
      chart : null,
      selectName:"",
      isLoading: false
    }
  },
  methods:{
    getChartData(Name){
      this.selectName = Name;
      this.$http.post(`${process.env.VUE_APP_API}dataStation`,{station:this.selectName}).then((response)=>{
        let temp = response.data;
        console.log(temp)
        let data ={}
        for(let key in temp){
          if(new Date(key)>=new Date(this.FromTime) && new Date(key)<=new Date(this.ToTime)){
            data[key] = temp[key];
          }
        }

        let chart = this.planetChartData.data;
        console.log(chart);
        chart.datasets[0].label = Name+"月雨量";
        chart.datasets[0].data = [];
        chart.datasets[0].backgroundColor = [];
        chart.labels = [];
        for(let key in data){
          chart.datasets[0].data.push(data[key]);
          chart.labels.push(key);
          chart.datasets[0].backgroundColor.push("rgba(255,216,0,0.5)");
        }
        this.chart.update();
      })
    },
    createChart(chartData) {
      const ctx = document.getElementById("planet-chart");
      const myChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
      this.chart = myChart;
    },
    getThreeLocate(event){
      let position = {latitude:event.latLng.lat(),longitude:event.latLng.lng()};
      this.$http.post(`${process.env.VUE_APP_API}findThreeStation`,{data:position}).then((response)=>{
        this.county = "全部";
        this.stations = response.data;
      })
    },
    resumeStation(){
      this.stations = this.AllStations;
    },
    changeTime(){
      if(this.selectName!=''){
        this.getChartData(this.selectName);
      }
    }
  },
  computed:{
    filterCounty : function(){
      if(this.county == "全部"){
        return this.stations;
      }else{
        let result = [];
        this.stations.forEach(item=>{
          if(item.county == this.county){
            result.push(item);
          }
        })
        return result;
      }
    }
  },
  created(){
    const vm =this;
    this.isLoading = true;
    this.$http.get(`${process.env.VUE_APP_API}stationsLocate`).then((response)=>{
      let s = new Set();
      vm.stations = response.data;
      vm.AllStations = response.data;
      vm.stations.forEach((item)=>{
        s.add(item.county);
      })
      vm.countySet.push("全部");
      vm.countySet = vm.countySet.concat(Array.from(s));
      this.isLoading = false;
    })
  },
  mounted(){
    this.createChart(this.planetChartData);
  }
}
</script>
