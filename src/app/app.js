$(function(){
    const WaterPoolModel = Backbone.Model.extend({
        defaults: {
            minLength: 4,
            maxLength: 15,
            maxHeight: 10,
            heights: [4, 2, 0, 3, 2, 5],
            length: 6,
        },
        refresh: function() {
            const lengthDifference = this.get('maxLength') - this.get('minLength');
            const nLength = this.get('minLength') + parseInt(lengthDifference * Math.random());
            this.set('nLength', nLength);
            const heights = [], maxHeight = this.get('maxHeight');
            for (let i = 0; i < nLength; i++) {
                heights.push(parseInt(maxHeight * Math.random()));
            }
            this.set('heights', heights);
        },
        trap: function() {
            const heights = this.get('heights');
            if (heights.length < 3) return 0;
    
            let res = 0, n = heights.length;
            let left_max = [0], right_max = [0];
    
            for(let i = 1; i < n - 1; i++)
            {
                left_max.push(Math.max(left_max[i - 1], heights[i - 1]));
                right_max.unshift(Math.max(right_max[0], heights[n - i]));
            }
            left_max.push(0);
            right_max.unshift(0);
    
            for (let i = 1; i < n - 1; i++)
                res += Math.max(0, Math.min(left_max[i], right_max[i]) - heights[i]);
            return res;
        }
    });

    const WaterPoolView = Backbone.View.extend({
        template: Handlebars.compile($("#water-pool-template").html()),
        model: new WaterPoolModel(),
        events: {
            "click #btn-generate": "refreshWaterPoolModel",
            "click #btn-test": "onClickTestButton",
        },
        refreshWaterPoolModel: function() {
          this.model.refresh();
        },
        onClickTestButton: function() {
          console.log(this.model.get('heights'));
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({
                heights: `[${this.model.get('heights').join(', ')}]`,
                trap: this.model.trap()
            }));
        }
    });
    
    const AppRouter = Backbone.Router.extend({
        routes: {
            '': 'waterPoolRoute',
        },
        waterPoolRoute: function () {
            $("main").html(new WaterPoolView().el);
        },
    });
    
    var appRouter = new AppRouter();
    Backbone.history.start();
})