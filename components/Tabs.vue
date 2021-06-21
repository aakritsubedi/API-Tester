<template>
  <div class="my-4">
    <ul class="nav nav-tabs" id="controller-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="query-params-tabs"
          data-bs-toggle="tab"
          data-bs-target="#query-params"
          type="button"
          role="tab"
          aria-controls="query-params"
          aria-selected="true"
        >
          Query Params
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="headers-tab"
          data-bs-toggle="tab"
          data-bs-target="#headers"
          type="button"
          role="tab"
          aria-controls="headers"
          aria-selected="false"
        >
          Headers
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="json-tab"
          data-bs-toggle="tab"
          data-bs-target="#json"
          type="button"
          role="tab"
          aria-controls="json"
          aria-selected="false"
        >
          JSON
        </button>
      </li>
    </ul>
    <div class="tab-content p-3 border-top-0 border" id="controller-tab-items">
      <div
        class="tab-pane fade show active"
        id="query-params"
        role="tabpanel"
        aria-labelledby="query-params-tab"
      >
        <div class="clearfix">
          <span class="h4 float-left">Query Params</span>
          <button class="add-btn" @click="addQueryParams">Add</button>
          <div
            class="query-params-container"
            v-for="(queryParam, key) in queryParams"
            :key="key"
          >
            <input
              type="text"
              v-model="queryParam.key"
              @change="updateURLWithNewQueryParams"
              placeholder="Keys"
              style="
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
              "
            />
            <input
              type="text"
              v-model="queryParam.value"
              @change="updateURLWithNewQueryParams"
              placeholder="Value"
            />
            <button @click="() => removeQueryParams(key)">Remove</button>
          </div>
        </div>
      </div>
      <div
        class="tab-pane fade"
        id="headers"
        role="tabpanel"
        aria-labelledby="header-tab"
      >
        <span class="h4 float-left">Request Headers</span>
        <button class="add-btn" @click="addRequestHeaders">Add</button>
        <div
          class="query-params-container"
          v-for="(header, key) in requestHeaders"
          :key="key"
        >
          <input
            type="text"
            v-model="header.key"
            placeholder="Keys"
            style="border-top-left-radius: 5px; border-bottom-left-radius: 5px"
          />
          <input type="text" v-model="header.value" placeholder="Value" />
          <button @click="() => removeRequestHeaders(key)">Remove</button>
        </div>
      </div>
      <div
        class="tab-pane fade"
        id="json"
        role="tabpanel"
        aria-labelledby="json-tab"
      >
        <span class="h4 float-left">Request Body</span>
        <div class="add-btn">Format: JSON</div>
        <div>
          <textarea
            rows="8"
            style="width: 100%;"
            id="prettyJSONFormat"
            v-model="body"
            @change="updateBody"
            @blur="prettyFormat"
            :class="jsonerror ? 'border-red' : 'border-green'"
          ></textarea>
          <div class="text-danger" v-if="body && jsonerror">
            {{ jsonerror }}
          </div>
          <div class="text-success" v-if="!jsonerror">Valid JSON ✔</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  props: [
    'queryParams',
    'addQueryParams',
    'removeQueryParams',
    'updateURLWithNewQueryParams',
    'requestHeaders',
    'addRequestHeaders',
    'removeRequestHeaders',
    'updateRequestBody',
    'requestBody'
  ],
  data() {
    return {
      jsonerror: '',
      body: '',
    }
  },
  created() {
    this.body = this.requestBody;
  },
  methods: {
    updateBody: function() {
      this.updateRequestBody(this.body);
      this.prettyFormat();
    },
    prettyFormat: function () {
      // reset error
      this.jsonerror = ''
      let jsonValue = ''
      try {
        jsonValue = JSON.parse(this.body)
      } catch (e) {
        this.jsonerror = JSON.stringify(e.message)
        let textarea = document.getElementById('prettyJSONFormat')
        if (this.jsonerror.indexOf('position') > -1) {
          // highlight error position
          let positionStr = this.jsonerror.lastIndexOf('position') + 8
          let posi = parseInt(
            this.jsonerror.substr(positionStr, this.jsonerror.lastIndexOf('"'))
          )
          if (posi >= 0) {
            textarea.setSelectionRange(posi, posi + 1)
          }
        }
        return ''
      }

      this.requestBody = JSON.stringify(jsonValue, null, 2)
    },
  },
}
</script>


<style scoped>
.query-params-container {
  margin: 8px 0;
  display: flex;
  flex-direction: row;
  width: 100%;
}
.query-params-container input {
  flex: 1;
  height: 35px;
  border: 1px solid #ccc;
  border-right: 0;
  outline: none;
  padding-left: 10px;
}
.query-params-container button {
  flex: 0;
  border: none;
  outline: none;
  border: 1px solid #f18e8e;
  color: #ff0000;
  background-color: unset;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}
.add-btn {
  margin-bottom: 10px;
  float: right;
  border: none;
  outline: none;
  border: 1px solid #c5f39b;
  color: #016901;
  background-color: unset;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
</style>