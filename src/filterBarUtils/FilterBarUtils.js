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

import isEmpty from 'lodash/isEmpty';
import moment from 'moment-timezone';

import {
  DISCOVER_FILTERS_ERROR_MSG,
  POST,
  POST_HEADER,
  SAME_ORIGIN,
  MESSAGE_LEVEL_WARNING,
  DATE_TIME_ZONE,
  FILTER_ATTRIBUTE_TO,
  FILTER_ATTRIBUTE_FROM,
  FILTER_ATTRIBUTE_CODE,
  FILTER_ATTRIBUTE_VALUES,
  FILTER_ATTRIBUTE_CONTROLS,
  FILTER_ATTRIBUTE_DEFAULT_VALUE,
  FILTER_TYPE_ENUM
} from 'src/FilterBarUtils/FilterBarConstants.js';

let fetch = require('node-fetch');
fetch.Promise = require('es6-promise').Promise;

/** Local functions */

function getFilterSearchURL(searchUrl) {
  return searchUrl.replace('@@IP-ADDRESS@@', document.location.hostname);
}

function getFiltersQueryObject(requestViewName) {
  let requestBody = {
    'viewName': requestViewName
  };

  return JSON.stringify(requestBody);
}

function getFiltersEvent(actionType, filterList) {
  return {
    type: actionType,
    data: filterList
  };
}

function generateFilterBarErrorEventMessage(actionType, msgText, msgSeverity) {
  return {
    type: actionType,
    data: {
      msgText: msgText,
      msgSeverity: msgSeverity
    }
  };
}

function combineMissingFilters(filterValues, allFilters) {
  let allFilterIds = Object.keys(allFilters);

  for (let id in allFilterIds) {
    if (!filterValues.hasOwnProperty(allFilterIds[id])) {
      filterValues[allFilterIds[id]] = '';
    }
  }

  return filterValues;
}

function getFilterSelectionEvent(actionType, selectedValuesMap, convertedValues) {
  return {
    type: actionType,
    data: {
      selectedValuesMap: convertedValues,
      unifiedValues: selectedValuesMap
    }
  };
}

function convertedFilterValuesEvent(actionType, nonConvertedValues, convertedValues) {
  return {
    type: actionType,
    data: {
      nonConvertedValues: nonConvertedValues,
      convertedValues: convertedValues
    }
  };
}

function mapValuesToOption(filterOptions, nonConvertedValue) {
  let mappedValues = {};

  for (let i in filterOptions) {
    if (filterOptions[i].code === nonConvertedValue) {
      mappedValues = filterOptions[i];
      break;
    }
  }

  return mappedValues;
}

function getSetUnifiedFilterValuesEvent(actionType, unifiedValues) {
  return {
    type: actionType,
    data: unifiedValues
  };
}

function getFilterDefault(filters, filterId) {
  let filterControlId = Object.keys(filters[filterId][FILTER_ATTRIBUTE_CONTROLS])[0];
  let defaultValue = filters[filterId][FILTER_ATTRIBUTE_CONTROLS][filterControlId][FILTER_ATTRIBUTE_DEFAULT_VALUE];
  if (!defaultValue) {
    defaultValue = {};
  }
  return defaultValue;
}

function extractConvertedDateValues(dateValues) {
  let convertedValues = {};
  if (dateValues.from) {
    let startMoment = moment(dateValues.from);
    convertedValues.startDate = startMoment.toDate();
    convertedValues.time_zone = startMoment.format(DATE_TIME_ZONE);
  }

  if (dateValues.to) {
    let endMoment = moment(dateValues.to);
    convertedValues.endDate = endMoment.toDate();
    convertedValues.time_zone = endMoment.format(DATE_TIME_ZONE);
  }

  convertedValues.code = dateValues.code;

  return convertedValues;
}

function convertFilterValues(filterValues) {
  let convertedFilterValues = {};

  for (let filterId in filterValues) {
    if (filterValues.hasOwnProperty(filterId) &&
      !isEmpty(filterValues[filterId]) && !isEmpty(filterValues[filterId].controls)) {
      let controls = filterValues[filterId].controls;
      let firstControlKey = Object.keys(controls)[0];
      if (controls[firstControlKey][FILTER_ATTRIBUTE_VALUES][FILTER_ATTRIBUTE_FROM] ||
        controls[firstControlKey][FILTER_ATTRIBUTE_VALUES][FILTER_ATTRIBUTE_TO]) {
        convertedFilterValues[filterId] =
          extractConvertedDateValues(controls[firstControlKey][FILTER_ATTRIBUTE_VALUES]);
      } else {
        let codeValue = controls[firstControlKey][FILTER_ATTRIBUTE_VALUES][FILTER_ATTRIBUTE_CODE];
        convertedFilterValues[filterId] = codeValue;
      }
    }
  }

  return convertedFilterValues;
}

/** Exported functions */

export function buildFilterValueMap(filterValueString) {
  let filterValueObj = {};
  let filters = filterValueString.split(',');

  for (let filterIndex in filters) {
    let filterStringParts = filters[filterIndex].split('=');

    filterValueObj[filterStringParts[0]] = filterStringParts[1];
  }

  return filterValueObj;
}

export function buildFilterValueMapFromObj(filterValues) {
  let filterValueObj = {};

  for (let filterIndex in filterValues) {
    filterValueObj[filterValues[filterIndex].filterId] = filterValues[filterIndex].filterValue;
  }

  return filterValueObj;
}

export function getFilterListQueryStringExcludeEmptyValues(filterValueList) {
  let filterQueryList = [];

  for (let filter in filterValueList) {
    if (filterValueList[filter]) {
      filterQueryList.push(
        {
          'filterId': filter,
          'filterValue': filterValueList[filter]
        }
      );
    }
  }

  return filterQueryList;
}

export function getFilterListQueryStringIncludeEmptyValues(filterValueList) {
  let filterQueryList = [];

  for (let filter in filterValueList) {
    if (filterValueList[filter]) {
      filterQueryList.push(
        {
          'filterId': filter,
          'filterValue': filterValueList[filter]
        }
      );
    } else {
      filterQueryList.push(
        {
          'filterId': filter
        }
      );
    }
  }

  return filterQueryList;
}

export function getUnifiedFilters(searchUrl, viewName, actionTypeSuccess, actionTypeFailure) {
  let filterRequestFormattedUrl = getFilterSearchURL(searchUrl);
  let filterRequestBody = getFiltersQueryObject(viewName);

  let fetchBody = {
    credentials: SAME_ORIGIN,
    method: POST,
    headers: POST_HEADER,
    body: filterRequestBody
  };

  return (dispatch) => {
    return fetch(filterRequestFormattedUrl, fetchBody).then(
      (response) => response.json()).then(
      (responseJson) => {
        dispatch(getFiltersEvent(actionTypeSuccess, responseJson.filters));
      }
      ).catch(
      () => {
        dispatch(generateFilterBarErrorEventMessage(actionTypeFailure,
          DISCOVER_FILTERS_ERROR_MSG, MESSAGE_LEVEL_WARNING));
      }
      );
  };
}

export function processFilterSelection(actionType, filterValues, allFilters) {
  let convertedFilterValues = convertFilterValues(filterValues);
  let combinedFilterValues = combineMissingFilters(convertedFilterValues, allFilters);

  return getFilterSelectionEvent(actionType, filterValues, combinedFilterValues);
}

export function mapValuesToDateOption(nonConvertedValue) {
  let mappedValues = {};

  if (nonConvertedValue.startDate) {
    mappedValues.from = new Date(nonConvertedValue.startDate);
  } else {
    mappedValues.from = null;
  }

  if (nonConvertedValue.endDate) {
    mappedValues.to = new Date(nonConvertedValue.endDate);
  } else {
    mappedValues.to = null;
  }

  mappedValues.code = nonConvertedValue.code;

  return mappedValues;
}

export function mapValuesToFilter(nonConvertedValues, allFilters, currentlySetFilterValues) {
  let convertedValues = {};

  for (let nonConvertedId in nonConvertedValues) {
    if (nonConvertedValues[nonConvertedId] !== '') {
      let matchingFilterObj = allFilters[nonConvertedId];
      let filterControlId = Object.keys(matchingFilterObj.controls)[0];
      let mappedValue = {};

      if (matchingFilterObj[FILTER_ATTRIBUTE_CONTROLS][filterControlId].type === FILTER_TYPE_ENUM.DATE) {
        mappedValue = mapValuesToDateOption(nonConvertedValues[nonConvertedId]);
      } else {
        mappedValue = mapValuesToOption(
          matchingFilterObj[FILTER_ATTRIBUTE_CONTROLS][filterControlId].options,
          nonConvertedValues[nonConvertedId]);
      }

      let values = {};
      values[FILTER_ATTRIBUTE_VALUES] = mappedValue;
      let filterControlers = {};
      filterControlers[filterControlId] = values;
      let filter = {};
      filter[FILTER_ATTRIBUTE_CONTROLS] = filterControlers;
      convertedValues[nonConvertedId] = filter;
    } else if (!isEmpty(currentlySetFilterValues[nonConvertedId])) {
      let matchingFilterObj = allFilters[nonConvertedId];
      let filterControlId = Object.keys(matchingFilterObj.controls)[0];
      let mappedValue = {};
      let values = {};
      values[FILTER_ATTRIBUTE_VALUES] = mappedValue;
      let filterControlers = {};
      filterControlers[filterControlId] = values;
      let filter = {};
      filter[FILTER_ATTRIBUTE_CONTROLS] = filterControlers;
      convertedValues[nonConvertedId] = filter;
    }
  }

  return convertedValues;
}

export function convertNonConvertedValues(actionType, nonConvertedValues, allFilters, currentlySetFilterValues) {
  let convertedValues = mapValuesToFilter(nonConvertedValues, allFilters, currentlySetFilterValues);
  return convertedFilterValuesEvent(actionType, nonConvertedValues, convertedValues);
}

export function clearFilters(actionType) {
  return {
    type: actionType
  };
}

export function setNonConvertedFilterValues(actionType, nonConvertedValues) {
  return {
    type: actionType,
    data: nonConvertedValues
  };
}

export function setFilterSelectionsToDefaults(defaultsPresentActionType, noDefaultsActionType, filters, filterValues) {
  let defaultFilterMap = {};

  for (let filterId in filters) {
    let filterDefaultValue = getFilterDefault(filters, filterId);
    if (!isEmpty(filterDefaultValue) || (filterValues && filterValues[filterId])) {
      let filterControlId = Object.keys(filters[filterId][FILTER_ATTRIBUTE_CONTROLS])[0];
      let controller = {};
      controller.values = filterDefaultValue;
      let controllers = {};
      controllers[filterControlId] = controller;
      let controls = {};
      controls.controls = controllers;
      defaultFilterMap[filterId] = controls;
    }
  }

  if (isEmpty(defaultFilterMap)) {
    let combinedValues = combineMissingFilters(defaultFilterMap, filters);
    return setNonConvertedFilterValues(noDefaultsActionType, combinedValues);
  } else {
    return getSetUnifiedFilterValuesEvent(defaultsPresentActionType, defaultFilterMap);
  }
}
