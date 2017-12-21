/*
 * Copyright © 2016-2017 European Support Limited
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
  FILTER_BAR_ACTION_TYPES : {
    SET_FILTERS: null,
    SET_FILTER_VALUES: null,
    CLEAR_FILTERS: null,
    FILTER_VALUE_CHANGE: null,
    NEW_SELECTIONS: null,
    SET_NON_CONVERTED_VALUES: null,
    SET_CONVERTED_VALUES: null,
    SET_UNIFIED_VALUES: null
  },
  FILTER_TYPE_ENUM : {
    LIST: 'dropDown',
    DATE: 'date'
  },
  DATE_TIME_ZONE : 'Z',
  DISCOVER_FILTERS_ERROR_MSG : 'There was an error retrieving the list of available filters',
  FILTER_BAR_TITLE : 'FILTER BY',
  FILTER_ATTRIBUTE_DEFAULT_VALUE : 'defaultValue',
  FILTER_ATTRIBUTE_CONTROLS : 'controls',
  FILTER_ATTRIBUTE_CODE : 'code',
  FILTER_ATTRIBUTE_VALUES : 'values',
  FILTER_ATTRIBUTE_TO : 'to',
  FILTER_ATTRIBUTE_FROM : 'from',
  POST : 'POST',
  POST_HEADER : { 'Accept': 'application/json' },
  SAME_ORIGIN : 'same-origin',
  MESSAGE_LEVEL_WARNING : 'warning'
};