$(document).ready(function () {
	$("#core").addClass('active');
	setDisplayNone();
	$("#coreContainer").css("display", "flex");

	$("input[id=chooseFile]").change(function() {
		$(".uploadFileLabel").text($(this).val());
	});

	// let arr = [[1, 2], [3, 4]];
	// let newElement = `<div id="errorBox" class="errorBox"></div>`;
	// $("#calcuateCoreContainer").append(newElement);
	// $("#errorBox").text(JSON.stringify(arr));
});

function removeClasses() {
	$("#core").removeClass('active');
	$("#linear").removeClass('active');
	$("#logistic").removeClass('active');
}

function setDisplayNone() {
	$("#coreContainer").css("display", "none");
	$("#linearContainer").css("display", "none");
	$("#logisticContainer").css("display", "none");
}

$("#core").click(function () {
	removeClasses();
	setDisplayNone();
	$("#core").addClass('active');
	$("#coreContainer").css("display", "flex");
});

$("#linear").click(function () {
	removeClasses();
	setDisplayNone();
	$("#linear").addClass('active');
	$("#linearContainer").css("display", "flex");
});

$("#logistic").click(function () {
	removeClasses();
	setDisplayNone();
	$("#logistic").addClass('active');
	$("#logisticContainer").css("display", "flex");
});

$("select[name='coreDropdown']").change(function() {
	if($(this).val() >= 6) {
		$("#input2").prop("disabled", true);
		$("#input2Dropdown").prop("disabled", true);
	}
	else {
		$("#input2").prop("disabled", false);
		$("#input2Dropdown").prop("disabled", false);
	}

	$("#errorBox").remove();
})

function pollResult(opId, timer) {
	$.ajax({
		url: `http://127.0.0.1:8000/app/result/${opId}`,
		type: "GET",
		success: function(res) {
			if(res.status == "computed") {
				let newElement = `<div id="calcuateCoreResult"></div>`;
				$("#calcuateCoreContainer").append(newElement);
				$("#calcuateCoreResult").text(`Result: ${JSON.stringify(res.result)}`);
				$("#calcuateCoreBtn").text("Calculate");
				clearInterval(timer);
			}
		}
	});
}

function createRequestObj() {
	let obj = {
		operation: parseInt($("select[name='coreDropdown']").val()),
		data1: $("#input1").val(),
	};

	if($("select[name='coreDropdown']").val() >= 6) {
		obj["data2"] = null;
		
	}
	else {
		obj["data2"] = $("#input2").val();

		if($("select[name='input1Dropdown']").val() === "matrix" && $("select[name='input2Dropdown']").val() === "matrix" && obj.operation == 4) {
			obj.operation = 1;
		}
	}

	return obj;
}

function checkInputs() {
	let check = "";
	
	if(($("select[name='coreDropdown']").val() == "select")) {
		check = "select";
	}
	if(($("#input1").val() == "")) {
		check = "input1";
	}
	if(($("#input2").val() == "") && $("select[name='coreDropdown']").val() < 6) {
		check = "input2";
	}
	if(($("select[name='input1Dropdown']").val() == "select")) {
		check = "input1Dropdown";
	}
	if(($("select[name='input2Dropdown']").val() == "select")) {
		check = "input2Dropdown";
	}

	return check;
}

function checkInput(num) {
	let newElement = `<div id="errorBox${num}" class="errorBox"></div>`;
	$("#calcuateCoreContainer").append(newElement);
	$(`#errorBox${num}`).text(`Input ${num} cannot be empty`);
}

$("#input1").on('input', function() {
	if($(this).val() == "") {
		checkInput(1);
	}
	else {
		$("#errorBox1").remove();
	}
});

$("#input2").on('input', function() {
	if($(this).val() == "") {
		checkInput(2);
	}
	else {
		$("#errorBox2").remove();
	}
});

$("#input1Dropdown").change(function() {
	$("#errorBoxInput1Dropdown").remove();
});

$("#input2Dropdown").change(function() {
	$("#errorBoxInput2Dropdown").remove();
});


$("#calcuateCoreBtn").click(function () {
	let check = checkInputs();
	$("#errorBox").remove();

	if(check != "") {
		let newElement;
		switch(check) {
			case "select":
				newElement = `<div id="errorBox" class="errorBox"></div>`;
				$("#calcuateCoreContainer").append(newElement);
				$("#errorBox").text(`Select an operation`);
				break;
			case "input1":
				checkInput(1);
				break;
			case "input2":
				checkInput(2);
				break;
			case "input1Dropdown":
				newElement = `<div id="errorBoxInput1Dropdown" class="errorBox"></div>`;
				$("#calcuateCoreContainer").append(newElement);
				$("#errorBoxInput1Dropdown").text(`Data Type cannot be empty`);
				break;
			case "input2Dropdown":
				newElement = `<div id="errorBoxInput2Dropdown" class="errorBox"></div>`;
				$("#calcuateCoreContainer").append(newElement);
				$("#errorBoxInput2Dropdown").text(`Data Type cannot be empty`);
				break;
			default:
				null;
		}
	}
	else {
		let obj = createRequestObj();
		$("#errorBoxInput1Dropdown").remove();
		$("#errorBoxInput2Dropdown").remove();
		
		$.ajax({
			url: "http://127.0.0.1:8000/app/compute/",
			type: "POST",
			data: JSON.stringify(obj),
			contentType: "application/json",
			success: function(result) {
				$("#calcuateCoreBtn").text("Calculating");
				$("#calcuateCoreBtn").prop("disabled", true);
				$("#calcuateCoreResult").remove();
				let timer = setInterval(function() {
					pollResult(result.op_id, timer);
				}, 5000);
			},
			error: function(xhr, status, error) {
				console.log(xhr, status, error);
				let newElement = `<div id="errorBox" class="errorBox"></div>`;
				$("#calcuateCoreContainer").append(newElement);
				$("#errorBox").text(`${xhr.responseText}`);
			}
		});
	}
});