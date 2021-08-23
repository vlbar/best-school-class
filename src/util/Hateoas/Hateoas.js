import axios from "axios";

//Class with utility functions
export default class Hateoas {
  //Fills parameter with replacing list of templated parameters ('{?...}')
  static fill(href, name, value) {
    if (href.includes("{")) href = href.slice(0, href.indexOf("{"));
    if (href.includes(name)) {
      href = href.replace(new RegExp(`${name}(=[^&]*)?(&)?`), "");
    }
    href += href.includes("?") ? "&" : "?";
    return `${href}${name}${value ? "=" + encodeURIComponent(value) : ""}`;
  }

  //Fills parameters with replacing list of templated parameters ('{?...}')
  static fillArray(href, fills) {
    for (var prop in fills) {
      href = this.fill(result, prop.toString(), fills[prop].toString());
    }

    return href;
  }

  //Checks parameter in list of templated parameters ('{?...}')
  static hasTemplateParameter(href, name) {
    return href.slice(href.indexOf("{"), href.indexOf("}")).includes(name);
  }

  //Get request by href with fillings (fillArray)
  //prefetch is a function that runs before fetch (setLoading maybe)
  static fetch(href, callback, cancelToken, fills) {
    return this.#withCallback(async () => {
      const response = await axios.get(
        fills ? this.fillArray(href, fills) : href,
        { cancelToken: cancelToken }
      );
      return response.data;
    }, callback);
  }

  //Other requests

  static post(href, data, callback, cancelToken) {
    return this.#withCallback(async () => {
      const response = await axios.post(href, data, { cancelToken });
      return response.data;
    }, callback);
  }

  static put(href, data, callback, cancelToken) {
    return this.#withCallback(async () => {
      const response = await axios.put(href, data, { cancelToken });
      return response.data;
    }, callback);
  }

  static patch(href, data, callback, cancelToken) {
    return this.#withCallback(async () => {
      const response = await axios.patch(href, data, { cancelToken });
      return response.data;
    }, callback);
  }

  static remove(href, callback, cancelToken) {
    return this.#withCallback(async () => {
      const response = await axios.delete(href, { cancelToken });
      return response.data;
    }, callback);
  }

  static #withCallback(action, callback) {
    if (callback) {
      callback(true);
      return action().finally(() => callback(false));
    } else return action();
  }
}
