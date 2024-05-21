FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env 
WORKDIR /app
EXPOSE 8080

# copy csproj and restore as distinct layers (from csproj to working directory) (line below deals with dependencies)
COPY *.csproj ./                
RUN dotnet restore                      

#copy everything and else
COPY . ./
RUN dotnet publish -c Release -o out

#build runtime image (smaller than full sdk used above in dotnet cmds) . is root of container  - API name of project folder
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT [ "dotnet", "API.dll" ]
