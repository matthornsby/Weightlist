document.ontouchmove = function(e) {
  return true;
};

var pathArray = window.location.pathname.split('/');
var stub = pathArray[1];

/* edit these */
var shift = 3;
var slope = 2;

var sum = 0;

function calculate(x) {
  y = slope * (1 * x) + shift;
  return y;
}

function total_value(x) {
  y = slope * (x * ((x + 1) / 2)) + shift * x;
  return y;
}

function percentage(calculate, total_value) {
  return Math.round(100 * calculate / total_value);
}

//assess the percentages
function evaluate_list(listData) {
  //display the list
  var count = $('.list__item').length,
    range = 0;

  //for each item
  $('.list__item').each(function(i) {
    x = count - i;

    //set random range low end of this item
    $(this).attr('data-start', range + 1);

    //calculate percentage of this item
    var value = percentage(calculate(x), total_value(count));

    //set random range high end of this item
    $(this).attr('data-end', (range = range + value));

    //write the circle-graph
    $('.donut__label', this).text(value + '%');
    $('.donut-segment', this).css('stroke-dasharray', value + 'px, ' + (100 - value) + 'px');
  });

  //save the list
  //save_list(listData);
}

function retrieve_list() {
  $.post('/api/retrieve.php', {
    stub: stub
  })
    .always(function() {
      console.log('retreive finished');
    })
    .done(function(data) {
      console.log('retreive success');

      console.log('in fucntion ' + data);

      listData = JSON.parse(data);

      update_list();
      evaluate_list();

      //return(data);
    })
    .fail(function() {
      console.log('retreive error');
    });
}

function save_list() {
  listData.items = [];

  //console.log(listData.items);

  $('#list .list__item--title').each(function(i) {
    //console.log( $(this).text() );
    listData.items[i] = { item_name: $(this).text() };
  });
  console.log(listData.items);

  //localStorage.setItem('Weightlist', JSON.stringify(listData));

  $.post('/api/save.php', {
    stub: stub,
    list_content: JSON.stringify(listData)
  })
    .done(function() {
      console.log('save success');
    })
    .fail(function() {
      console.log('save error');
    })
    .always(function() {
      console.log('save finished');
    });
}

//loop through the list data
function update_list() {
  $('#list_name').text(listData.name);
  var reList = '';
  for (var listItem in listData.items) {
    //console.log(listData.items[listItem].item_name);
    reList = reList + render_item(listData.items[listItem].item_name);
  }
  $('#list').html(reList);
}

function moveCursorToEnd(el) {
  if (typeof el.selectionStart == 'number') {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != 'undefined') {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function removeEditable(element) {
  $(element).removeAttr('contenteditable');
  $(element).text($(element).text());

  $('.list__wrapper').css('padding-bottom', '0');

  evaluate_list();
  save_list();
}

function makeEditable(element) {
  $('.list__wrapper').css('padding-bottom', '100vh');

  $(element)
    .attr('contenteditable', 'true')
    .text($(element).text())
    .focus();

  $('html, body').animate(
    {
      scrollTop: $(element).offset().top
    },
    500,
    'swing',
    function() {}
  );

  $(element).bind('keyup', function(e) {
    if (e.keyCode == '13') {
      removeEditable(element);
    }
  });

  $(element).bind('blur', function(e) {
    removeEditable(element);
  });

  $(element).bind('focusout', function(e) {
    removeEditable(element);
  });
}

//create the list item
function render_item(new_item) {
  return (
    `<li class="list__item" data-start="0" data-end="100">
    <span class="list__item--title">` +
    new_item +
    `</span>

    <svg width="100%" height="100%" viewBox="0 0 38 38" class="donut list__item--chance">
      <circle class="donut-ring" cx="19" cy="19" r="15.91549430918954"  ></circle>
      <circle class="donut-segment" cx="19" cy="19" r="15.91549430918954" style=""></circle>

        <text x="50%" y="50%" class="donut__label">
        </text>

    </svg>
  </li>`
  );
}

function setupSlip(list) {
  list.addEventListener(
    'slip:animateswipe',
    function(e) {
      //console.log(e);
      //if you swipe another while one is already editable
      $(list)
        .find('[contenteditable]')
        .removeAttr('contenteditable');

      var swipePercentage = Math.abs(e.detail.x) / $(e.target).outerWidth();

      //console.log(e.detail.x);
      //swiping left to right
      if (e.detail.x > 0) {
        //fade out the item title
        $(e.target)
          .addClass('swiping-right')
          .children('.list__item--title')
          .css('opacity', 1 - 2 * swipePercentage);

        //console.log(swipePercentage);
        if (swipePercentage > 0.5) {
          $(e).off('slip:animateswipe');
          $(e.target)
            .removeClass('swiping-right')
            .children('.list__item--title')
            .css('opacity', 1)
            .each(function() {
              makeEditable($(this));
              $(this).select(); //doesn't seem to work
            });
          e.preventDefault(); //stop it from moving
        }
        e.preventDefault(); //keep it from moving
      }

      if (e.detail.x < 0) {
        //fade out the item
        if (swipePercentage <= 0.5) {
          console.log(swipePercentage);
          $(e.target)
            .addClass('swiping-left')
            .css('margin-top', -20 * swipePercentage + '%')
            .css('margin-bottom', -20 * swipePercentage + '%')
            .css('opacity', 1 - 2 * swipePercentage);
        }

        //console.log(swipePercentage);
        if (swipePercentage > 0.5) {
          $(e.target).remove();
          evaluate_list();
          save_list();
          e.preventDefault(); //keep it from moving
        }
        //e.preventDefault(); //keep it from moving
      }
    },
    false
  );

  list.addEventListener('slip:cancelswipe', function(e) {
    $(e.target)
      .removeClass('swiping-right')
      .css('opacity', 1)
      .css('margin', 1)
      .removeClass('swiping-left')
      .children('.list__item--title')
      .css('opacity', 1);
  });

  //cancel editing if they do anything
  list.addEventListener('slip:beforewait', function(e) {
    $(list)
      .find('[contenteditable]')
      .removeAttr('contenteditable')
      .blur();
  });

  list.addEventListener(
    'slip:reorder',
    function(e) {
      e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);

      evaluate_list();
      save_list();
      return false;
    },
    false
  );
  return new Slip(list);
}

//var listData = localStorage.getItem('Weightlist');

if (localStorage.getItem('Weightlist') === null) {
  var listData = `
  {"name": "After Aikido",
    "items": [
      { "item_name": "Dirty Franks Hot Dog Palace" },
      { "item_name": "Local Cantina" },
      { "item_name": "Harvest Bar + Kitchen" },
      { "item_name": "Yellow Brick Pizza" }
    ]
  }`;
  //var listData = "{}";

  //...
} else {
  var listData = `
  {"name": "After Aikido",
    "items": [
      { "item_name": "Swipe right to rename an item" },
      { "item_name": "Swipe left to edit an iten" }
    ]
  }`;
  //var listData = "{}";

  //var listData = localStorage.getItem('Weightlist');
  //var listData = retrieve_list();

  //console.log(listData);
}

listData = JSON.parse(listData);

$(function() {
  //build list from json

  //console.log( "retreive: " + retrieve_list() );

  //update_list();
  //evaluate_list();

  $.when(retrieve_list()).then(function() {
    console.log('then');
  });

  setupSlip(document.querySelector('#list'));

  list.addEventListener('slip:reorder', function(e) {
    // e.target list item reordered.
    console.log('reorder-attempt');
    /*
    if (reorderedOK) {
      e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);
      console.log('reordered-OK');
    } else {
      console.log('reordered-Fail');
      // element will fly back to original position
      e.preventDefault();
    }
    */
  });

  $('#list-add').on('click', function(e) {
    console.log('add');
    e.preventDefault();

    $('#list').append(render_item(''));
    //$('#list .list__item').last().children('.list__item--title').attr('contenteditable', 'true').focus();

    $('#list .list__item')
      .last()
      .children('.list__item--title')
      .each(function() {
        makeEditable($(this));
      });
  }); // add item

  $('#list-rando').on('click', function(e) {
    console.log('rando');
    e.preventDefault();

    //pick a random number between 1 and 100
    var random = Math.floor(Math.random() * 100 + 1);

    $('.list__item').each(function(i) {
      if (random >= $(this).data('start') && random <= $(this).data('end')) {
        alert($('.list__item--title', this).text());
      }
    });

    console.log(random);
  });

  /*
  console.log(count);

  $('.list__item').each(function(i) {
    x = count - i;
    console.log(x + ':' + calculate(x) + ' - ' + percentage(calculate(x), total_value(count)) + '% - ' + $('.list__item--title', this).text());

    sum = sum + calculate(x);
  });

  console.log('sum =' + sum);

  console.log('total value =' + total_value(count));
  */
});
