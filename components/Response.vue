<template>
  <div class="response-container">
    <div class="">
      <div class="response-header">
        <div class="title">
          <h3>Response</h3>
          <span v-if="isWaiting">Hit Send to get a response</span>
        </div>
        <div class="status" v-if="!isWaiting">
          <ul>
            <li>Status: {{ response.status }}</li>
            <li>Time: {{ response.time }}ms</li>
            <li>Size: {{ response.size }}</li>
          </ul>
        </div>
      </div>
      <div class="my-2" v-if="!isWaiting">
        <ul class="nav nav-tabs" id="controller-tab" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="response-body-tab"
              data-bs-toggle="tab"
              data-bs-target="#response-body"
              type="button"
              role="tab"
              aria-controls="query-params"
              aria-selected="true"
            >
              Body
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="response-headers-tab"
              data-bs-toggle="tab"
              data-bs-target="#response-headers"
              type="button"
              role="tab"
              aria-controls="headers"
              aria-selected="false"
            >
              Headers
            </button>
          </li>
        </ul>
        <div
          class="tab-content p-3 border-top-0 border"
          id="controller-tab-items"
        >
          <div
            class="tab-pane fade show active"
            id="response-body"
            role="tabpanel"
            aria-labelledby="query-params-tab"
          >
            <div class="response-body">
              <vue-json-pretty :path="'root'" :data="response.body" />
            </div>
          </div>
          <div
            class="tab-pane fade"
            id="response-headers"
            role="tabpanel"
            aria-labelledby="header-tab"
          >
            <table>
              <tr
                v-for="(header, key) in Object.keys(response.headers)"
                :key="key"
              >
                <th width="35%">{{ header }}</th>
                <td width="65%">{{ response.headers[header] }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div class="waiting-response" v-else>
        <div class="test-your-api">
          <img src="@/assets/images/waiting.jpeg" alt="Test Your API">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

export default {
  name: 'Response',
  props: ['response', 'isWaiting'],
  components: {
    VueJsonPretty,
  },
}
</script>