class Product {
  constructor(data) {
    this.data = data;
    console.log(data);
  }

  getCardForProduct() {
    let $card = $("<div class='product_card'></div>");
    $card.append(`<img src='data/images/${this.data.url}' class='product_image' alt='${this.data.name}'>`);
    $card.data("data-value", this.data);
    return $card;
  }
}
class ProductList {
	constructor(options) {
    this.options = options;
    this.filters = options.filters;
    this.$container = options.containerProducts;
    this.$filtersAfter = options.filtersAfter;
    this.toggleFilters = options.toggleFilters;
    this.filtersApplied = {};
	}

  addNewProduct(data) {
    const product = new Product(data);
    this.$container.append(product.getCardForProduct());
  }

  renderProductsList(dataList) {
    this.$container.html("");
    this.dataList = dataList;
    dataList.forEach((data) => {
      this.addNewProduct(data);
    });
    this.setFiltersLists();
  }

  setFiltersLists() {
    this.filtersLists = {};
    this.$filterContainer = {};
    this.filters.forEach(this.setUpFilterForProperty.bind(this));
  }

  setUpContainer(property, heading) {
    this.$filterContainer[property] = this.getNewFilterContainer(property, heading);
    this.$filterContainer[property].insertAfter(this.$filtersAfter);
    this.$filterContainer[property].delegate("input", "click", this.filterClickEventHandler.bind(this));
  }

  setUpFilterForProperty(property) {
    if(Object.keys(this.toggleFilters).includes(property)) {
      this.setUpToggleFilter(property);
    }
    else {
      this.setUpNormalFilter(property);
    }
  }

  setUpToggleFilter(property) {
    let { heading, value, labelText } = this.toggleFilters[property];
    this.setUpContainer(property, heading);
    this.$filterContainer[property].append(this.getCheckBoxItem(labelText, value, property));
  }

  setUpNormalFilter(property) {
    this.setUpContainer(property, property);
    this.filtersLists[property] = [...new Set(this.dataList.map(item => item[property]))];
    this.filtersLists[property].sort().forEach((value) => {
      this.$filterContainer[property].append(this.getCheckBoxItem(value, value, property));
    });
  }

  removeElementFormArray(array, value) {
    let index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  filterClickEventHandler(event) {
    let $target = $(event.target),
        propertyName = $target.attr("data-filter-name"),
        value = $target.val();
    if($target.is(":checked")) {
      this.filtersApplied[propertyName] = this.filtersApplied[propertyName] || [];
      this.filtersApplied[propertyName].push(value);
      this.showFilteredList(true);
    }
    else {
      this.removeElementFormArray(this.filtersApplied[propertyName], value);
      this.showFilteredList(false);
    }
  }

  getNewFilterContainer(property, heading) {
    let $container = $(`<div data-product-filter="${property}">
                     <h3 class='capitalize'>${heading}</h3>
                     </div>`);
    return $container;                 
  }

  getCheckBoxItem(labelText, value, property) {
    let $checkBox = `<input type="checkbox" id="${labelText}" value="${value}" data-filter-name="${property}">
                     <label for="${labelText}">${labelText}</label><br>`;
    return $checkBox;
  }

  showFilteredList(checked) {
    let $products = this.$container.children();;
    $products.each((index, product) => {
      const $product = $(product),
            result = this.validateFilters($product.data('data-value'));      
      if(result) {
        $product.show();
      }
      else {
        $product.hide();
      }
    });
  }

  validateFilters(data) {
    let result = true;
    Object.keys(this.filtersApplied).forEach((key) => {
      let values = this.filtersApplied[key];
      if(values.indexOf(data[key]) === -1 && values.length > 0) {
        result = false;
      }
    });
    return result;
  }
}
class ContentLoader {
  constructor(options) {
    this.options = options;
    this.fileURL = options.fileURL;
    this.productList = new ProductList(options.productListOptions);
  }

  init() {
    this.fetchDataAndShowList();
  }

  promiseToFetchDataService() {
    return new Promise((resolve, reject) => {
      if(this.data) {
        resolve(this.data);
      }
      $.getJSON(this.fileURL, data => {
          this.data = data;
          resolve(data);
        }).fail((jqxhr, textStatus, error) => {
          reject(new Error(`There was a ${error} Error`));
      });
    });
  }

  fetchDataAndShowList() {
    this.promiseToFetchDataService().then(resultData => {
      this.productList.renderProductsList(resultData);
    }).catch(error => {
      console.log(error);
    });
  }
}
$(document).ready(() => {
  const options = {
    fileURL: "data/products.json",
    productListOptions: {
      containerProducts: $("[data-product-list-container='container']"),
      filters: ['brand', 'color', 'sold_out', 'size'],
      filtersAfter: $("[data-product-filter-after='after']"),
      toggleFilters: { 
        'sold_out': {
          heading: "Availablity",
          labelText: "Available Products",
          value: 0
        }
      }
    } 
  };
  let contentLoader = new ContentLoader(options);
  contentLoader.init();
});
