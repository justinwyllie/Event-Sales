//run with --target ES5
/// <reference path="node_modules/@types/jquery/index.d.ts" />
// <reference path="node_modules/@types/backbone/index.d.ts" />
// <reference path="node_modules/@types/underscore/index.d.ts" />
jQuery(function() {

    function greeter(person) {
        return "Hello, " + person;
    }
    
    var user = "Jane User";
    
    document.body.innerHTML = greeter(user);
    
    


     //see the comment inline in the backbone def file about not using backbone's extend which is defined as private and
    //see https://blorkfish.wordpress.com/2013/03/20/typescript-strongly-typed-backbone-models/
    //since typechecking is not obligatory we could just not do it   but here we use it with ES5 getters/setters 
   
    class ImageModel extends Backbone.Model {
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
    
        constructor() {
            super();
            this.Id = 1;
            this.file = "test1";
        }
    }
        
    
    var imageModel = new ImageModel();
    imageModel.Id = 2;
    imageModel.file = 'test2.jpg';
    console.log(imageModel);
    
    
    
    
    

})
