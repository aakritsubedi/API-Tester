<template>
  <div class="container-fluid pb-5">
    <Navbar />
    <div class="row mt-4">
      <div class="col-md-7">
        <div class="card">
          <div class="card-body">
            <div style="display: flex">
              <select v-model="apiMethod" class="api-methods">
                <option value="get">GET</option>
                <option value="post">POST</option>
                <option value="put">PUT</option>
                <option value="patch">PATCH</option>
                <option value="delete">DELETE</option>
              </select>
              <input
                type="text"
                v-model="apiURL"
                class="api-url"
                placeholder="URL..."
                @change="parseURL"
              />
              <button class="api-send-btn" @click="sendRequest">
                <i class="fas fa-paper-plane"></i>
                <span style="margin-left: 5px">Send</span>
              </button>
            </div>
            <div style="display: flex; align-items: center">
              <input
                type="text"
                class="api-name"
                v-model="requestName"
                placeholder="Request Name"
              />
              <div title="Clear All" style="cursor: pointer" @click="clear">
                <i
                  class="fas fa-eraser"
                  style="font-size: 20px; color: #de4839"
                ></i>
              </div>
            </div>
          </div>
        </div>
        <Tabs
          :queryParams="queryParams"
          :addQueryParams="addQueryParams"
          :removeQueryParams="removeQueryParams"
          :updateURLWithNewQueryParams="updateURLWithNewQueryParams"
          :requestHeaders="requestHeaders"
          :addRequestHeaders="addRequestHeaders"
          :removeRequestHeaders="removeRequestHeaders"
          :requestBody="requestBody"
          :updateRequestBody="updateRequestBody"
        />
        <hr />
        <History
          :histories="histories"
          :setDataFromHistory="setDataFromHistory"
          :deleteHistory="deleteHistory"
        />
      </div>
      <div class="col-md-5">
        <Response :response="response" :isWaiting="isWaiting" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import prettyBytes from 'pretty-bytes'

import Tabs from '@/components/Tabs.vue'
import Navbar from '@/components/Navbar.vue'
import History from '@/components/History.vue'
import Response from '@/components/Response.vue'

import storageUtils from '@/utils/storageUtils'

export default {
  name: 'MyPostman',
  components: {
    Navbar,
    Tabs,
    Response,
    History,
  },
  data() {
    return {
      requestName: 'Untitled Request',
      apiMethod: 'get',
      apiURL: '',
      queryParams: [{ key: '', value: '' }],
      requestBody: '{}',
      requestHeaders: [
        { key: 'Content-Type', value: 'application/json' },
        { key: '', value: '' },
      ],
      isLoading: false,
      isWaiting: true,
      response: {
        status: '',
        time: '',
        size: '',
        body: '',
        headers: '',
        data: '',
        error: false,
      },
      histories: null,
    }
  },
  methods: {
    clear: function () {
      this.requestName = 'Untitled Request'
      this.apiMethod = 'get'
      this.apiURL = ''
      this.queryParams = [{ key: '', value: '' }]
      this.requestBody = '{}'
      this.requestHeaders = [
        { key: 'Content-Type', value: 'application/json' },
        { key: '', value: '' },
      ]
      this.isLoading = false
      this.isWaiting = true
      this.response = {
        status: '',
        time: '',
        size: '',
        body: '',
        headers: '',
        data: '',
        error: false,
      }
    },
    validateURL: function (url) {
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      ) // fragment locator
      return !!pattern.test(url)
    },
    updateURLWithNewQueryParams: function () {
      let queryString = '?'
      this.queryParams.forEach((params, index) => {
        if (params.key && params.value) {
          queryString +=
            index !== 0
              ? `&${params.key}=${params.value}`
              : `${params.key}=${params.value}`
        }
      })
      const baseUrl = this.apiURL.split('?')[0] || this.apiURL
      const url = baseUrl + queryString
      this.apiURL = url
    },
    addQueryParams: function () {
      this.queryParams.push({ key: '', value: '' })
    },
    removeQueryParams: function (index) {
      this.queryParams.splice(index, 1)
      this.updateURLWithNewQueryParams()
    },
    addRequestHeaders: function () {
      this.requestHeaders.push({ key: '', value: '' })
    },
    removeRequestHeaders: function (index) {
      this.requestHeaders.splice(index, 1)
    },
    parseURL: function () {
      const url = this.apiURL
      const queryParams = url.split('?')[1] || ''
      const queryParamsList = queryParams.split('&') || ''
      const paramsList = []
      queryParamsList.forEach((params) => {
        paramsList.push({
          key: params.split('=')[0],
          value: params.split('=')[1],
        })
      })

      this.queryParams = paramsList
    },
    keyValuePairsToObject: function (objArr) {
      let object = {}
      objArr.forEach((params) => {
        const { key, value } = params
        if (key && value) {
          object[key] = value
        }
      })

      return object
    },
    updateEndTime: (response) => {
      if (response) {
        response.customData = response.customData || {}
        response.customData.time =
          new Date().getTime() - response.config.customData.startTime
      }
      return response
    },
    sendRequest: async function () {
      let history = storageUtils.get('history')
      history = JSON.parse(history)

      const storeData = {
        requestName: this.requestName,
        apiMethod: this.apiMethod,
        apiURL: this.apiURL,
        queryParams: this.queryParams,
        requestBody: this.requestBody,
        requestHeaders: this.requestHeaders,
      }
      history.push(storeData)
      this.histories = history

      storageUtils.set('history', JSON.stringify(history))

      this.error = false
      this.isLoading = true
      this.isWaiting = false

      const config = {
        url: this.apiURL.split('?')[0],
        method: this.apiMethod,
        params: this.keyValuePairsToObject(this.queryParams),
        headers: this.keyValuePairsToObject(this.requestHeaders),
        data: JSON.parse(this.requestBody),
      }

      axios.interceptors.request.use((request) => {
        request.customData = request.customData || {}
        request.customData.startTime = new Date().getTime()

        return request
      })

      axios.interceptors.response.use(this.updateEndTime, (e) => {
        return Promise.reject(this.updateEndTime(e.response))
      })

      try {
        const response = await axios(config)
        const info = {
          headers: response.headers,
          status: response.status,
          time: response.customData.time,
          size: prettyBytes(
            JSON.stringify(response.data).length +
              JSON.stringify(response.headers).length
          ),
          body: response.data,
        }
        this.response = info
      } catch (err) {
        this.error = true
        const info = {
          headers: [],
          status: 'Error',
          time: '- ',
          size: 'Unknown',
          body: [],
        }
        this.response = info
      }
    },
    updateRequestBody: function (body) {
      this.requestBody = body
    },
    setDataFromHistory: function (id) {
      const data = this.histories[id]

      this.requestName = data.requestName
      this.apiMethod = data.apiMethod
      this.apiURL = data.apiURL
      this.queryParams = data.queryParams
      this.requestBody = data.requestBody
      this.requestHeaders = data.requestHeaders
    },
    deleteHistory: function (id) {
      this.histories.splice(id, 1);

      storageUtils.set('history', JSON.stringify(this.histories))
    },
  },
  created() {
    let history = storageUtils.get('history')
    if (history == null) {
      history = []
      storageUtils.set('history', JSON.stringify(history))
    }

    this.histories = JSON.parse(history)
  },
}
</script>

<style>
@import url('@/assets/css/style.css');
</style>
