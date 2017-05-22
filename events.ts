//run with --target ES5
/// <reference path="node_modules/@types/jquery/index.d.ts" />
// <reference path="node_modules/@types/backbone/index.d.ts" />
// <reference path="node_modules/@types/underscore/index.d.ts" />
jQuery(function() {


    //TODO 
    //make the app a class https://www.typescriptlang.org/docs/handbook/classes.html

    let pricing9x6: {print: number, mounted: number} = {print: 1.00, mounted: 9.00};
    let pricing10x8: {print: number, mounted: number} = {print: 1.00, mounted: 9.00};
    let pricing12x8: {print: number, mounted: number} = {print: 1.50, mounted: 10.00};
    let pricing10x10: {print: number, mounted: number} = {print: 1.00, mounted: 9.00};
    let pricing12x12: {print: number, mounted: number} = {print: 1.50, mounted: 11.00};
    let pricing: { "9x6": object, "10x8": object, "12x8": object, "10x10": object, "12x12": object} = 
    { "9x6": pricing9x6, "10x8": pricing10x8, "12x8": pricing12x8, "10x10":pricing12x8, "12x12": pricing12x12};
    
     type Del = {
        per_print: number,
        per_mounted_print: number
     }
    
    let deliveryUK: Del = {per_print: 0.50, per_mounted_print: 1.00};
    let deliveryOs: Del = {per_print: 1.00, per_mounted_print: 2.00};
    let delivery: {deliveryUK: Del, deliveryOs: Del} = {deliveryUK: deliveryUK, deliveryOs: deliveryOs};
    
    let getHighestOrderLineNumber = function(orders: object): number {
        let orderLineNumbers: string[] = [];
        for (let orderNumber in orders) {
            orderLineNumbers.push(orderNumber);    
        }
        return Math.max.apply(Math, orderLineNumbers);
    };
    
    let calculateAndSetDeliveryAndTotals = function(country: string): void {
    
        let cummulativePrice: number = 0;
        let cummulativeDel: number = 0;
        let overallTotal: number = 0;
        let delModel: Del;
        
        if (country === 'GB') {
            delModel = this.delivery.deliveryUK;
        } else {
            delModel = this.delivery.deliveryOs;
        }
        
        for (let i in this.orders) {
            let orderLine: OrderLineModel = orders[i];
            //nb TS will typecheck this: orderLine.price but not this: orderLine.get("price"). 
            //even though the get method on the Class is typed. is it because the latter is only resolved at runtime?
            let price: number = orderLine.price;
            let mount: boolean = orderLine.mount;
            let qty: number = orderLine.qty;
            if (mount) {
                cummulativeDel = cummulativeDel + (qty * delModel.per_mounted_print);    
            } else {
                cummulativeDel = cummulativeDel + (qty * delModel.per_print);     
            }
            cummulativePrice = cummulativePrice + price;
        }
        overallTotal = cummulativePrice +  cummulativeDel;
        
        this.customerOrderModel.goods_total =  cummulativePrice;
        this.customerOrderModel.delivery_charge =  cummulativeDel;
        this.customerOrderModel.total_cost =  overallTotal;
        
        
         
        
        $('#del').html(Number(cummulativeDel).toFixed(2));
        $('#total').html(Number(overallTotal).toFixed(2));
    
    }


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
            this.set("qty", 0);
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
            this.set("qty", 0);
            this.set("mount", false);
            this.set("file", "");
            
        }
    }
    
   class CustomerOrderModel extends Backbone.Model {
   
        defaults(): any {
            return {country: 'GB'};
        }

        
        get Id(): number {
            return this.get('Id');
        }
        set Id(value: number) {
            this.set('Id', value);
        }
       
        get name(): string {
            return this.get('name');
        }
        set name(value: string) {
            this.set('name', value);
        }
        
        get organisation(): string {
            return this.get('organisation');
        }
        set organisation(value: string) {
            this.set('organisation', value);
        }
        
        get email(): string {
            return this.get('email');
        }
        set email(value: string) {
            this.set('email', value);
        }
        
        get address_name(): string {
            return this.get('address_name');
        }
        set address_name(value: string) {
            this.set('address_name', value);
        }
        
 
        
        get address1(): string {
            return this.get('address1');
        }
        set address1(value: string) {
            this.set('address1', value);
        }
        
        get address2(): string {
            return this.get('address2');
        }
        set address2(value: string) {
            this.set('address2', value);
        }
        
        get city(): string {
            return this.get('city');
        }
        set city(value: string) {
            this.set('city', value);
        }
        
        get postcode(): string {
            return this.get('postcode');
        }
        set postcode(value: string) {
            this.set('postcode', value);
        }
        
        get country(): string {
            return this.get('country');
        }
        set country(value: string) {
            this.set('country', value);
        }
        
        get goods_total(): number {
            return this.get('goods_total');
        }
        set goods_total(value: number) {
            this.set('goods_total', value);
        }
        
        get delivery_charge(): number {
            return this.get('delivery_charge');
        }
        set delivery_charge(value: number) {
            this.set('delivery_charge', value);
        }
        
        get total_cost(): number {
            return this.get('total_cost');
        }
        set total_cost(value: number) {
            this.set('total_cost', value);
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
    
    $("#content").on("change", ".cust_input", function(this) {
        let val = $(this).val();
        let field =  $(this).attr("id");
        app.customerOrderModel[field] = val;
  
    })
    
    $(".panel_hook").on("show.bs.collapse", function(this) {
       let country = app.customerOrderModel.country;
       calculateAndSetDeliveryAndTotals.call(app, country);    
    })
    
    $("select#country").on("change", function(this) {
       let country = $(this).val(); 
       app.customerOrderModel.country = country;
       calculateAndSetDeliveryAndTotals.call(app, country);    
    })
    
    $("#paypal").click(function() {
    
       
        let customerData: object = app.customerOrderModel.toJSON();
        let orders: {} = {};
        for (let i in app.orders) {
            orders[i] =  app.orders[i].toJSON();
        }
        
        let amount: number = app.customerOrderModel.total_cost;
        
        let orderData: {orders: object, customerData: object} = {orders: orders, customerData:  customerData};
        
        let showUserError = function(msg: string): void {
            $("#user_message").html(msg);
            $("#user_message").removeClass("alert-success");
            $("#user_message").removeClass("alert-info");
            $("#user_message").addClass("alert-danger");
            $("#user_message").show();
        }
        
        let showUserSuccess =    function(msg: string): void {
            $("#user_message").html(msg);
            $("#user_message").removeClass("alert-danger");
            $("#user_message").removeClass("alert-info");
            $("#user_message").addClass("alert-success");
            $("#user_message").show();
        }
        
        let custEmail: string = app.customerOrderModel.get("email");
        let custAddress1 = app.customerOrderModel.get("address1");
        let custCity = app.customerOrderModel.get("city");
        let custCountry = app.customerOrderModel.get("country");
        let custPostcode = app.customerOrderModel.get("postcode");
        //TODO this is  a hack - use model validation
        let valid: boolean = true;
        if ((custEmail === "") || (custEmail == undefined) )  {
            valid = false;
        }
        if ((custAddress1 === "") || (custAddress1 == undefined) )  {
            valid = false;
        }
        if ((custCity === "") || (custCity == undefined) )  {
            valid = false;
        }
       if ((custCountry === "") || (custCountry == undefined) )  {
            valid = false;
        }
        if ((custPostcode === "") || (custPostcode == undefined) )  {
            valid = false;
        }
        
        
        if  (valid === false ) {
            showUserError("Please check the form and complete all required fields");
         
        } else {
        
                let orderDataStr: string = JSON.stringify(orderData);
                $("#user_message").hide();
                $.ajax({
                       url: 'order_handler.php',
                       method: 'POST',
                       data: orderDataStr,
                       dataType: 'json',
                       success: function(result) {
                            if (result.result) {
                                let orderId: number = result.orderId;
                                $("#paypal_form #item_number").val(orderId);
                                $("#paypal_form #amount").val(amount);
                                $("#paypal_form #address1").val(app.customerOrderModel.address1);
                                $("#paypal_form #address2").val(app.customerOrderModel.address2);
                                $("#paypal_form #city").val(app.customerOrderModel.city);
                                $("#paypal_form #country").val(app.customerOrderModel.country);
                                $("#paypal_form #email").val(app.customerOrderModel.email);
                                $("#paypal_form #zip").val(app.customerOrderModel.postcode);
                                $("#paypal_form").submit();
                                
                            } else {
                                showUserError("Sorry. There has been an error. Please contact me for assistance");   
                            }
                       },
                       error: function() {
                            showUserError("Sorry. There has been an error. Please contact me for assistance");
                       }
                });
            
        }        
    });
                            
        
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
   

    });
 
       
//setup 
  
let order_init: { order_line_number: number; } = { order_line_number: 1};
let html = orderLineTmplFnc(order_init); 
$(".order_lines_container").append(html);
//create model for first order line and add to collection
let orderModel = new OrderLineModel();
orderModel.Id = 1;
let orders = {};
let customerOrderModel = new CustomerOrderModel();

let app: {pricing: object, delivery: object, orders: object, customerOrderModel: CustomerOrderModel } = 
    {pricing: pricing, delivery: delivery, orders: orders, customerOrderModel: customerOrderModel};
app.orders[1] =  orderModel;








})
