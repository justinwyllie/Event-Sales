//run with --target ES5
/// <reference path="node_modules/@types/jquery/index.d.ts" />
// <reference path="node_modules/@types/backbone/index.d.ts" />
// <reference path="node_modules/@types/underscore/index.d.ts" />
jQuery(function() {

    //TODO 
    //use views
    //make the app a class https://www.typescriptlang.org/docs/handbook/classes.html
    
    //HACK - it will come from the back-end
    var pricing9x6: {print: number, mounted: number} = {print: 1.00, mounted: 9.00};
    var pricing10x8: {print: number, mounted: number} = {print: 1.00, mounted: 9.00};
    var pricing12x8: {print: number, mounted: number} = {print: 1.50, mounted: 10.00};
    var pricing10x10: {print: number, mounted: number} = {print: 1.00, mounted: 9.00};
    var pricing: {"9x6": object, "10x8": object, "12x8": object, "10x10": object} = {"9x6": pricing9x6, "10x8": pricing10x8, "12x8": pricing12x8, "10x10":pricing12x8};
    
    var deliveryUK: {per_print: number, per_mounted_print: number} = {per_print: 0.50, per_mounted_print: 1.00};
    var deliveryOs: {per_print: number, per_mounted_print: number} = {per_print: 1.00, per_mounted_print: 2.00};
    var delivery: {deliveryUK: object, deliveryOs: object} = {deliveryUK: deliveryUK, deliveryOs: deliveryOs};
    
    let orders = {};
    
    let getHighestOrderLineNumber = function(orders: object): number {
    
        let orderLineNumbers: string[] = [];
        for (let orderNumber in orders) {
            orderLineNumbers.push(orderNumber);    
        }
        
        return Math.max.apply(Math, orderLineNumbers);
    
    };
    
    let app: {pricing: object, delivery: object, orders: object} = {pricing: pricing, delivery: delivery, orders: orders};

    let orderLineTmplFnc = _.template($("#order_line").html());


     //see the comment inline in the backbone def file about not using backbone's extend which is defined as private and
    //see https://blorkfish.wordpress.com/2013/03/20/typescript-strongly-typed-backbone-models/
    //https://blorkfish.wordpress.com/2012/10/10/typescript-and-backbone-sinon-gotchas/
    //since typechecking is not obligatory we could just not do it   but here we use it with ES5 getters/setters 
    //https://github.com/tastejs/todomvc/blob/gh-pages/examples/typescript-backbone/js/app.ts
    class OrderLineModel extends Backbone.Model {
        get Id(): number {
            return this.get('Id');
        }
        set Id(value: number) {
            this.set('Id', value);
        }
        set file(value: string) {
            this.set('file', value);
        }
        get file(): string {
            return this.get('file');
        }
       set size(value: string) {
            this.set('size', value);
        }
        get size(): string {
            return this.get('size');
        }
        set mount(value: boolean) {
            this.set('mount', value);
        }
        get mount(): boolean {
            return this.get('mount');
        }
        set qty(value: number) {
            this.set('qty', value);
        }
        get qty(): number {
            return this.get('qty');
        }
        
        set price(value: number) {
            this.set('price', value);
        }
        get price(): number {
            return this.get('price');
        }
        
        private caclulatePrice() {
            let price = 0.00;
            if ((this.file !== "") && (this.size !== "") && (this.file != undefined) && (this.size != undefined)) {
                let size = this.size;
                let pricingModel = app.pricing[size];
                let mount = this.mount;
                let qty = this.qty;
                if (mount === false) {
                    price = qty * pricingModel.print;
                }   else {
                    price = qty * pricingModel.mounted; 
                }
            }
            this.price = price;
            $(".order_lines_container").trigger("priceUpdate", {orderNumber: this.Id, price: this.price});
            
        }
        
        public reset() {
            this.set("size", "");
            this.set("qty", 1);
            this.set("mount", false);
            this.set("file", "");
            $(".order_lines_container").trigger("priceReset", {orderNumber: this.Id});
        }
    
        initialize() {
           _.bindAll(this, 'caclulatePrice', 'reset');
           let that = this;
           this.on("change",  function() { that.caclulatePrice()  });

        }
    
        constructor() {
            super();
            //TODO use defaults  see above links for how to do this. this makes multiple calls to calcPrice
            this.set("size", "");
            this.set("qty", 1);
            this.set("mount", false);
            this.set("file", "");
            
        }
    }
    
   class CustomerOrderModel extends Backbone.Model {
        get Id(): number {
            return this.get('Id');
        }
        set Id(value: number) {
            this.set('Id', value);
        }
        //name, organisation, email
        set customerDetails(value: object) {
            this.set('customerDetails', value);
        }
        get customerDetails(): object {
            return this.get('customerDetails');
        }
        //address_name, addres1, address1, city, postcode, country
        set customerAddress(value: object) {
            this.set('customerAddress', value);
        }
        get customerAddress(): object {
            return this.get('customerAddress');
        }
        //goods, del, total
        set totals(value: object) {
            this.set('totals', value);
        }
        get totals(): object {
            return this.get('totals');
        }

        constructor() {
            super();
        }
    }    
    
    
    $(".order_lines_container").on("priceUpdate", function(e, data) {
        let price = Number(data.price).toFixed(2);
        $(".order_lines_container").find("#order_line_"+data.orderNumber).find(".price_field").html(price);
    
    })
    
    $(".order_lines_container").on("priceReset", function(e, data) {
        $(".order_lines_container").find("#order_line_"+data.orderNumber + ' select.multi_size').val('');  
        $(".order_lines_container").find("#order_line_"+data.orderNumber + ' input.single_size').val('');
        $(".order_lines_container").find("#order_line_"+data.orderNumber + ' select.mount').val('no_mount');
    })
    
    //model updating that would be automatic if we were using Angular
    
    $(".order_lines_container").on("change", "select.mount", function(this) {
        let parent = $(this).parents(".order_line");
        let orderNumber = parent.data("order-line");
        let mountChoice = $(this).val(); 
        if (mountChoice === "no_mount") {
            app.orders[orderNumber].mount = false;
        } else {
            app.orders[orderNumber].mount = true;
        }
    })
    
   $(".order_lines_container").on("change", "input.qty", function(this) {
        let parent = $(this).parents(".order_line");
        let orderNumber = parent.data("order-line");
        let qty = $(this).val(); 
        app.orders[orderNumber].qty = qty;
    })
    
   $(".order_lines_container").on("change", "select.multi_size", function(this) {
        let parent = $(this).parents(".order_line");
        let orderNumber = parent.data("order-line");
        let size = $(this).val(); 
        app.orders[orderNumber].size = size.replace(/"/g, '').replace(/ /g,''); 
    })
        
 
        
       $(".order_lines_container").on("click", ".check", function(this) {
       
            var parent = $(this).parents(".order_line");
            var orderNumber = parent.data("order-line");
            var file = parent.find(".file").val();
        
            $.ajax({
               url: 'get_file_ratio.php',
               method: 'GET',
               data: 'file='+file,
               dataType: 'json',
               success: function(result) {
                    if (result.result) {
                        parent.find(".pic_holder").empty();
                        parent.find(".pic_holder").append($("<img />").attr("src", "thumbs/"+result["path"]));
                        parent.find(".pic_missing").hide();
                        if (Array.isArray(result.size)) {
                            var tmplFnc = _.template($("#multiple_sizes").html()); 
                            
                        } else {
                            var tmplFnc = _.template($("#single_size").html());
                            app.orders[orderNumber].size = result.size.replace(/"/g, '').replace(/ /g,'');  
                        }
                        result.order_number = orderNumber;
                        var html = tmplFnc(result);  
                        parent.find(".size_block").html(html); 
                        app.orders[orderNumber].file = file;

                        
                    } else {
                        parent.find(".pic_holder").empty();
                        parent.find(".pic_missing").show();
                        app.orders[orderNumber].reset();
                    }
               },
               error: function() {
                    parent.find(".pic_holder").empty();
                    parent.find(".pic_missing").show();
                    app.orders[orderNumber].reset();
               }
            });
    
    });
    
    
    
    $(".add_order_line_button").click(function(this) {
    
        //get current highest order number  
        //add 1
        //add a new model to the collection
        //render the template and append it
        //all of this is a lazy hack until i have time to implement the order lines as views not _ templates which need the number maintained   in index and on page
        
        let highestOrderLineNumber = getHighestOrderLineNumber(app.orders);
        let newOrderNumber = highestOrderLineNumber + 1;
        let orderModel = new OrderLineModel();
        orderModel.Id = newOrderNumber;
        app.orders[newOrderNumber] =  orderModel;
        let order_init: { order_line_number: number; } = { order_line_number: newOrderNumber};
        let html = orderLineTmplFnc(order_init); 
        $(".order_lines_container").append(html);

    });
    
    
    $(".order_lines_container").on("click", ".order_line_remove_block", function(this) {
        let parent = $(this).parents(".order_line");
        let orderNumber = parent.data("order-line");
        parent.remove();
        delete app.orders[orderNumber];
        console.log(app.orders);

    });
       
//render the first order line  
  
let order_init: { order_line_number: number; } = { order_line_number: 1};
let html = orderLineTmplFnc(order_init); 
$(".order_lines_container").append(html);
//create model for first order line and add to collection
let orderModel = new OrderLineModel();
orderModel.Id = 1;
app.orders[1] =  orderModel;

//lib functions






})
