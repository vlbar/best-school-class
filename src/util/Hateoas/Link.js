import axios from "axios";
import Hateoas from "./Hateoas";

//Represents certain link with actions
//Examples:
//link.fill('ass', 'cum').withTParam('billy', 'herrington')?.fetch() --- gachi.muchi.com/actors?ass=cum&&billy=herrington
//- fills ass by cum and fetch only if billy parameter is present which fills by herrington
//link.onTParam('lovko', () => alert('ti pridumal'))
//- alerts if lovko parameter is present
export default class Link {
  constructor(href, originHref) {
    this.originHref = originHref ?? href;
    this.href =
      href.indexOf("{?") > 0 ? href.slice(0, href.indexOf("{?")) : href;
    this.source = axios.CancelToken.source();
    this.params = this.href
      .slice(this.href.indexOf("?") + 1)
      .split("&")
      .map((param) => {
        var splitted = param.split("=");
        return { key: splitted[0], value: splitted[1] };
      });
  }

  //returns value of filled param
  param(name) {
    return this.params.find((param) => param.key === name)?.value;
  }

  //fill('auf', 'volki')
  fill(name, value) {
    return new Link(Hateoas.fill(this.href, name, value), this.originHref);
  }

  //fillArray({'auf' : 'volki', 'action' : 'govoryat})
  fillArray(fills) {
    return new Link(Hateoas.fillArray(this.href, fills), this.originHref);
  }

  hasTParam(name) {
    return Hateoas.hasTemplateParameter(this.originHref, name);
  }

  //Run callback function if parameter is in list of templated parameters : link.onTParam('volki', () => sayAuf())
  onTParam(name, callback) {
    if (this.hasTParam(name)) callback();
  }

  //Return filled this if parameter is in list of templated parameters : link.withTParam('auf', 'volki')?.fetch() --- auf.volki.com/dicks?auf=volki
  withTParam(name, fillValue) {
    return this.hasTParam(name) ? this.fill(name, fillValue) : null;
  }

  withPathTale(tale) {
    return new Link(this.href + `/${tale}`, this.originHref);
  }

  fetch(callback, fills) {
    return Hateoas.fetch(this.href, callback, this.source.token, fills);
  }

  post(data, callback) {
    return Hateoas.post(this.href, data, callback, this.source.token);
  }

  put(data, callback) {
    return Hateoas.put(this.href, data, callback, this.source.token);
  }

  patch(data, callback) {
    return Hateoas.patch(this.href, data, callback, this.source.token);
  }

  remove(callback) {
    return Hateoas.remove(this.href, callback, this.source.token);
  }
}
