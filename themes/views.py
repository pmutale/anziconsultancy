from django.shortcuts import render


def home(request):
    context = {
        
    }
    return render(request, "themes/work_in_progress/under_construction.html", context)
