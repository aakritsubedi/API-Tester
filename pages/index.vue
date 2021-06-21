<template>
  <div class="container-fluid p-4">
    <Navbar />
    <div class="row mt-4">
      <div class="col-md-8">
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
                <i class="fas fa-bacon"></i>
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
        <Response :response="response" :isWaiting="isWaiting" />
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3>History</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import prettyBytes from 'pretty-bytes'

import Tabs from '@/components/Tabs.vue'
import Navbar from '@/components/Navbar.vue'
import Response from '@/components/Response.vue'

export default {
  name: 'MyPostman',
  components: {
    Navbar,
    Tabs,
    Response,
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
      console.log(config)
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
  },
}
</script>

<style>
/* Testing */
.testing {
  padding: 15px 0;
}
.label {
  display: block;
  font-size: 1rem;
  color: #9b9b9b;
  margin-bottom: 15px;
}
.api-methods {
  border: none;
  outline: none;
  padding: 10px 15px;
  background-color: #dfdfdf;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}
.api-url {
  width: 100%;
  outline: none;
  border-right: none;
  padding-left: 10px;
  border: 1px solid #ccc;
}
.api-send-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border: none;
  background-color: #54b87b;
  color: #fff;
  padding: 0px 15px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;
}
.btn-disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.results {
  margin: 15px 0;
}
.api-input {
  display: none;
  margin: 15px 0;
}
.api-name {
  padding-left: 10px;
  margin: 5px 0;
  margin-right: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  height: 35px;
  width: 100%;
  outline: none;
}
.api-name:focus {
  border: 1px solid #888;
}
.displayBlock {
  display: block;
}
.api-input textarea {
  width: 100%;
  resize: none;
  background-color: #ffffff;
  text-align: left;
  font-size: 16px;
  outline: none;
  color: #2e2e2e;
  border-radius: 5px;
  padding: 10px 8px;
}
.text-success {
  color: #54b87b;
}
.text-danger {
  color: #ff0000;
}
.border-green {
  border: 1px solid #54b87b;
}
.border-red {
  border: 1px solid #ff0000;
}
/* Response */
.response-header {
  display: flex;
  justify-content: space-between;
}
.response-header .title {
  flex: 5;
}
.response-header .status {
  flex: 1;
}
</style>
